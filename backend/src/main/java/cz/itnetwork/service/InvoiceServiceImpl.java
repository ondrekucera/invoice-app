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

    @Override
    public InvoiceDTO addInvoice(InvoiceDTO invoiceDTO) {
        InvoiceEntity entity = invoiceMapper.toEntity(invoiceDTO);

        long buyerId = invoiceDTO.getBuyer().getId();
        long sellerId = invoiceDTO.getSeller().getId();

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

    private InvoiceEntity fetchInvoiceById(long id) {
        return invoiceRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Faktura s id " + id + " nebyla nalezena."));
    }

    @Override
    public StatisticsDTO getStatistics() {
        List<InvoiceEntity> all = invoiceRepository.findAll();
        long count = all.size();
        long sum = all.stream().mapToLong(InvoiceEntity::getPrice).sum();
        long average = count > 0 ? sum / count : 0;
        return new StatisticsDTO(count, sum, average);
    }
}