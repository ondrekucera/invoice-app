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
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class InvoiceServiceImpl implements InvoiceService {

    @Autowired
    private InvoiceMapper invoiceMapper;

    @Autowired
    private InvoiceRepository invoiceRepository;

    @Autowired
    private PersonRepository personRepository;

    // Ověří business pravidla faktury – volá se při vytvoření i aktualizaci
    private void validateInvoice(InvoiceDTO invoiceDTO) {
        if (invoiceDTO.getBuyer() == null) {
            throw new BusinessException("Kupující je povinný.");
        }
        if (invoiceDTO.getSeller() == null) {
            throw new BusinessException("Prodávající je povinný.");
        }
        if (invoiceDTO.getBuyer().getId() == null) {
            throw new BusinessException("Kupující musí mít platné ID.");
        }
        if (invoiceDTO.getSeller().getId() == null) {
            throw new BusinessException("Prodávající musí mít platné ID.");
        }
        // Kupující a prodávající musí být různé osoby
        if (invoiceDTO.getBuyer().getId().equals(invoiceDTO.getSeller().getId())) {
            throw new BusinessException("Kupující a prodávající nesmí být stejná osoba.");
        }
        // Splatnost nesmí být před datem vystavení
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

    @Override
    public InvoiceDTO addInvoice(InvoiceDTO invoiceDTO) {
        validateInvoice(invoiceDTO);

        InvoiceEntity entity = invoiceMapper.toEntity(invoiceDTO);

        long buyerId = invoiceDTO.getBuyer().getId();
        long sellerId = invoiceDTO.getSeller().getId();

        // Načtení skutečných entit z DB – mapper mapuje pouze ID
        PersonEntity buyer = personRepository.findById(buyerId)
                .orElseThrow(() -> new EntityNotFoundException("Kupující s id " + buyerId + " nebyl nalezen."));
        PersonEntity seller = personRepository.findById(sellerId)
                .orElseThrow(() -> new EntityNotFoundException("Prodávající s id " + sellerId + " nebyl nalezen."));

        entity.setBuyer(buyer);
        entity.setSeller(seller);

        entity = invoiceRepository.save(entity);
        return invoiceMapper.toDTO(entity);
    }

    @Override
    public InvoiceDTO getInvoiceById(long id) {
        return invoiceMapper.toDTO(fetchInvoiceById(id));
    }

    @Override
    public List<InvoiceDTO> getAll(InvoiceFilterDTO filter) {
        Specification<InvoiceEntity> spec = InvoiceSpecification.filterBy(filter);

        List<InvoiceEntity> result;
        // Limit se aplikuje jako page(0) – vrátí pouze prvních N záznamů
        if (filter != null && filter.getLimit() != null && filter.getLimit() > 0) {
            result = invoiceRepository.findAll(spec, PageRequest.of(0, filter.getLimit())).getContent();
        } else {
            result = invoiceRepository.findAll(spec);
        }

        return result.stream()
                .map(invoiceMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<InvoiceDTO> getSalesByPersonId(long personId) {
        return invoiceRepository.findBySellerId(personId)
                .stream()
                .map(invoiceMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<InvoiceDTO> getPurchasesByPersonId(long personId) {
        return invoiceRepository.findByBuyerId(personId)
                .stream()
                .map(invoiceMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public InvoiceDTO updateInvoice(long id, InvoiceDTO invoiceDTO) {
        validateInvoice(invoiceDTO);

        InvoiceEntity entity = fetchInvoiceById(id);

        long buyerId = invoiceDTO.getBuyer().getId();
        long sellerId = invoiceDTO.getSeller().getId();

        PersonEntity buyer = personRepository.findById(buyerId)
                .orElseThrow(() -> new EntityNotFoundException("Kupující s id " + buyerId + " nebyl nalezen."));
        PersonEntity seller = personRepository.findById(sellerId)
                .orElseThrow(() -> new EntityNotFoundException("Prodávající s id " + sellerId + " nebyl nalezen."));

        entity.setInvoiceNumber(invoiceDTO.getInvoiceNumber());
        entity.setIssued(invoiceDTO.getIssued());
        entity.setDueDate(invoiceDTO.getDueDate());
        entity.setProduct(invoiceDTO.getProduct());
        entity.setPrice(invoiceDTO.getPrice());
        entity.setVat(invoiceDTO.getVat());
        entity.setNote(invoiceDTO.getNote());
        entity.setBuyer(buyer);
        entity.setSeller(seller);

        entity = invoiceRepository.save(entity);
        return invoiceMapper.toDTO(entity);
    }

    @Override
    public void deleteInvoice(long id) {
        InvoiceEntity entity = fetchInvoiceById(id);
        invoiceRepository.delete(entity);
    }

    // Společná metoda pro načtení faktury – vyhodí 404 pokud neexistuje
    private InvoiceEntity fetchInvoiceById(long id) {
        return invoiceRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Faktura s id " + id + " nebyla nalezena."));
    }

    // Statistiky počítáme přímo v DB – nevytahujeme všechny entity do paměti
    @Override
    public StatisticsDTO getStatistics() {
        long count = invoiceRepository.countAll();
        long sum = invoiceRepository.sumAllPrices();
        long average = count > 0 ? sum / count : 0;
        return new StatisticsDTO(count, sum, average);
    }
}
