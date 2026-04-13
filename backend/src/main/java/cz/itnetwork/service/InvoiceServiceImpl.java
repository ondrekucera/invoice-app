package cz.itnetwork.service;

import cz.itnetwork.dto.InvoiceDTO;
import cz.itnetwork.dto.InvoiceFilterDTO;
import cz.itnetwork.dto.StatisticsDTO;
import cz.itnetwork.dto.mapper.InvoiceMapper;
import cz.itnetwork.entity.InvoiceEntity;
import cz.itnetwork.entity.PersonEntity;
import cz.itnetwork.entity.repository.InvoiceRepository;
import cz.itnetwork.entity.repository.InvoiceSpecification;
import cz.itnetwork.entity.repository.PersonRepository;
import cz.itnetwork.exception.BusinessException;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

// Class-level @Transactional – všechny public metody běží v transakci.
// Read-only metody přepisují default pomocí readOnly = true (optimalizace: Hibernate nespouští dirty checking).
@Service
@Transactional
public class InvoiceServiceImpl implements InvoiceService {

    private final InvoiceMapper invoiceMapper;
    private final InvoiceRepository invoiceRepository;
    private final PersonRepository personRepository;

    public InvoiceServiceImpl(
            InvoiceMapper invoiceMapper,
            InvoiceRepository invoiceRepository,
            PersonRepository personRepository
    ) {
        this.invoiceMapper     = invoiceMapper;
        this.invoiceRepository = invoiceRepository;
        this.personRepository  = personRepository;
    }

    @Override
    public InvoiceDTO addInvoice(InvoiceDTO invoiceDTO) {
        validateInvoiceBusinessRules(invoiceDTO);
        InvoiceEntity entity = buildInvoiceEntity(invoiceDTO);
        return invoiceMapper.toDTO(invoiceRepository.save(entity));
    }

    @Override
    public List<InvoiceDTO> addInvoicesBulk(List<InvoiceDTO> invoiceDTOs) {
        if (invoiceDTOs == null || invoiceDTOs.isEmpty()) {
            throw new BusinessException("Seznam faktur nesmí být prázdný.");
        }

        // Validujeme a sestavujeme entity před uložením – chyba u jedné faktury zastaví celý bulk
        List<InvoiceEntity> entities = invoiceDTOs.stream()
                .map(dto -> {
                    validateInvoiceBusinessRules(dto);
                    return buildInvoiceEntity(dto);
                })
                .collect(Collectors.toList());

        List<InvoiceEntity> saved = invoiceRepository.saveAll(entities);

        return saved.stream()
                .map(invoiceMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public InvoiceDTO getInvoiceById(long id) {
        return invoiceMapper.toDTO(fetchInvoiceById(id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<InvoiceDTO> getAll(InvoiceFilterDTO filter) {
        Specification<InvoiceEntity> spec = InvoiceSpecification.filterBy(filter);

        List<InvoiceEntity> invoices;
        if (filter != null && filter.getLimit() != null && filter.getLimit() > 0) {
            // Limit se realizuje jako první stránka – nevytahujeme celou tabulku do paměti
            invoices = invoiceRepository.findAll(spec, PageRequest.of(0, filter.getLimit())).getContent();
        } else {
            invoices = invoiceRepository.findAll(spec);
        }

        return invoices.stream()
                .map(invoiceMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<InvoiceDTO> getSalesByPersonId(long personId) {
        return invoiceRepository.findBySellerId(personId)
                .stream()
                .map(invoiceMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<InvoiceDTO> getPurchasesByPersonId(long personId) {
        return invoiceRepository.findByBuyerId(personId)
                .stream()
                .map(invoiceMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public InvoiceDTO updateInvoice(long id, InvoiceDTO invoiceDTO) {
        validateInvoiceBusinessRules(invoiceDTO);

        // Načteme existující entitu, abychom přepsali pouze předaná pole a zachovali metadata
        InvoiceEntity entity = fetchInvoiceById(id);
        entity.setInvoiceNumber(invoiceDTO.getInvoiceNumber());
        entity.setIssued(invoiceDTO.getIssued());
        entity.setDueDate(invoiceDTO.getDueDate());
        entity.setProduct(invoiceDTO.getProduct());
        entity.setPrice(invoiceDTO.getPrice());
        entity.setVat(invoiceDTO.getVat());
        entity.setNote(invoiceDTO.getNote());
        entity.setBuyer(resolvePersonById(invoiceDTO.getBuyer().getId(), "Kupující"));
        entity.setSeller(resolvePersonById(invoiceDTO.getSeller().getId(), "Prodávající"));

        return invoiceMapper.toDTO(invoiceRepository.save(entity));
    }

    @Override
    public void deleteInvoice(long id) {
        invoiceRepository.delete(fetchInvoiceById(id));
    }

    @Override
    @Transactional(readOnly = true)
    public StatisticsDTO getStatistics() {
        LocalDate today     = LocalDate.now();
        LocalDate monthFrom = today.withDayOfMonth(1);
        LocalDate monthTo   = today.withDayOfMonth(today.lengthOfMonth());

        long count          = invoiceRepository.countAll();
        long sum            = invoiceRepository.sumAllPrices();
        // Průměr chráníme proti dělení nulou pro případ prázdné databáze
        long average        = count > 0 ? sum / count : 0;
        // SUM s DPH vrací double – zaokrouhlujeme na celé Kč
        long totalWithVat   = Math.round(invoiceRepository.sumAllPricesWithVatRaw());
        long overdueCount   = invoiceRepository.countOverdue(today);
        long thisMonthCount = invoiceRepository.countInPeriod(monthFrom, monthTo);
        long highestInvoice = invoiceRepository.maxPrice();

        return new StatisticsDTO(count, sum, average, totalWithVat, overdueCount, thisMonthCount, highestInvoice);
    }

    // ── Private helpers ──────────────────────────────────────────────────────

    /**
     * Sestaví InvoiceEntity z DTO včetně načtení skutečných Person entit z DB.
     * Sdílená logika pro addInvoice i addInvoicesBulk – eliminuje duplicitu.
     */
    private InvoiceEntity buildInvoiceEntity(InvoiceDTO invoiceDTO) {
        InvoiceEntity entity = invoiceMapper.toEntity(invoiceDTO);
        // Mapper přenáší pouze ID – skutečné entity načítáme z DB, aby JPA vztahy fungovaly správně
        entity.setBuyer(resolvePersonById(invoiceDTO.getBuyer().getId(), "Kupující"));
        entity.setSeller(resolvePersonById(invoiceDTO.getSeller().getId(), "Prodávající"));
        return entity;
    }

    /**
     * Ověří business pravidla faktury – volá se při vytvoření i aktualizaci.
     * Bean Validation (@NotNull, @DecimalMin) pokrývá základní kontroly;
     * tato metoda přidává logiku závislou na kombinaci více polí.
     */
    private void validateInvoiceBusinessRules(InvoiceDTO invoiceDTO) {
        if (invoiceDTO.getBuyer() == null || invoiceDTO.getBuyer().getId() == null) {
            throw new BusinessException("Kupující je povinný a musí mít platné ID.");
        }
        if (invoiceDTO.getSeller() == null || invoiceDTO.getSeller().getId() == null) {
            throw new BusinessException("Prodávající je povinný a musí mít platné ID.");
        }
        // Zabraňuje tomu, aby kupující a prodávající byli stejná osoba
        if (invoiceDTO.getBuyer().getId().equals(invoiceDTO.getSeller().getId())) {
            throw new BusinessException("Kupující a prodávající nesmí být stejná osoba.");
        }
        // Splatnost logicky nemůže předcházet datu vystavení
        if (invoiceDTO.getDueDate().isBefore(invoiceDTO.getIssued())) {
            throw new BusinessException("Datum splatnosti nesmí být před datem vystavení.");
        }
        if (invoiceDTO.getPrice() < 0) {
            throw new BusinessException("Cena nesmí být záporná.");
        }
        if (invoiceDTO.getVat() < 0) {
            throw new BusinessException("DPH nesmí být záporné.");
        }
    }

    /**
     * Načte osobu podle ID nebo vyhodí výjimku s kontextovou zprávou (role = "Kupující" / "Prodávající").
     * Odděluje lookup logiku od míst volání, aby chybové zprávy byly srozumitelné.
     */
    private PersonEntity resolvePersonById(Long personId, String role) {
        return personRepository.findById(personId)
                .orElseThrow(() -> new EntityNotFoundException(
                        role + " s id " + personId + " nebyl(a) nalezen(a)."
                ));
    }

    /** Načte fakturu nebo vyhodí 404. Centralizuje opakující se lookup vzor. */
    private InvoiceEntity fetchInvoiceById(long id) {
        return invoiceRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Faktura s id " + id + " nebyla nalezena."
                ));
    }
}
