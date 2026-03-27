package cz.itnetwork.controller;

import cz.itnetwork.dto.InvoiceDTO;
import cz.itnetwork.dto.InvoiceFilterDTO;
import cz.itnetwork.dto.StatisticsDTO;
import cz.itnetwork.service.InvoiceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/invoices")
public class InvoiceController {

    @Autowired
    private InvoiceService invoiceService;

    @GetMapping
    public List<InvoiceDTO> getInvoices(
            @RequestParam(required = false) Long buyerId,
            @RequestParam(required = false) Long sellerId,
            @RequestParam(required = false) String product,
            @RequestParam(required = false) Long minPrice,
            @RequestParam(required = false) Long maxPrice,
            @RequestParam(required = false) Integer limit
    ) {
        InvoiceFilterDTO filter = new InvoiceFilterDTO();
        filter.setBuyerId(buyerId);
        filter.setSellerId(sellerId);
        filter.setProduct(product);
        filter.setMinPrice(minPrice);
        filter.setMaxPrice(maxPrice);
        filter.setLimit(limit);
        return invoiceService.getAll(filter);
    }

    @GetMapping("/statistics")
    public StatisticsDTO getStatistics() {
        return invoiceService.getStatistics();
    }

    @GetMapping("/{id}")
    public InvoiceDTO getInvoiceById(@PathVariable Long id) {
        return invoiceService.getInvoiceById(id);
    }

    @GetMapping("/sales/{personId}")
    public List<InvoiceDTO> getSalesByPersonId(@PathVariable Long personId) {
        return invoiceService.getSalesByPersonId(personId);
    }

    @GetMapping("/purchases/{personId}")
    public List<InvoiceDTO> getPurchasesByPersonId(@PathVariable Long personId) {
        return invoiceService.getPurchasesByPersonId(personId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public InvoiceDTO addInvoice(@RequestBody InvoiceDTO invoiceDTO) {
        return invoiceService.addInvoice(invoiceDTO);
    }

    @PutMapping("/{id}")
    public InvoiceDTO updateInvoice(@PathVariable Long id, @RequestBody InvoiceDTO invoiceDTO) {
        return invoiceService.updateInvoice(id, invoiceDTO);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteInvoice(@PathVariable Long id) {
        invoiceService.deleteInvoice(id);
    }
}