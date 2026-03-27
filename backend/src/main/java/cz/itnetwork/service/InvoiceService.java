package cz.itnetwork.service;

import cz.itnetwork.dto.InvoiceDTO;
import cz.itnetwork.dto.InvoiceFilterDTO;
import cz.itnetwork.dto.StatisticsDTO;

import java.util.List;

public interface InvoiceService {

    InvoiceDTO addInvoice(InvoiceDTO invoiceDTO);

    InvoiceDTO getInvoiceById(long id);

    List<InvoiceDTO> getAll(InvoiceFilterDTO filter);

    List<InvoiceDTO> getSalesByPersonId(long personId);

    List<InvoiceDTO> getPurchasesByPersonId(long personId);

    InvoiceDTO updateInvoice(long id, InvoiceDTO invoiceDTO);

    void deleteInvoice(long id);

    StatisticsDTO getStatistics();
}
