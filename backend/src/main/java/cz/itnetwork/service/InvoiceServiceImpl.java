package cz.itnetwork.service;

import cz.itnetwork.dto.InvoiceDTO;
import cz.itnetwork.dto.mapper.InvoiceMapper;
import cz.itnetwork.entity.InvoiceEntity;
import cz.itnetwork.entity.PersonEntity;
import cz.itnetwork.entity.repository.InvoiceRepository;
import cz.itnetwork.entity.repository.PersonRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
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
    public List<InvoiceDTO> getAll() {
        return invoiceRepository.findAll()
                .stream()
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
}