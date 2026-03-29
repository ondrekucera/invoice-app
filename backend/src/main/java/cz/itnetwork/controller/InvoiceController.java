package cz.itnetwork.controller;

import cz.itnetwork.dto.InvoiceDTO;
import cz.itnetwork.dto.InvoiceFilterDTO;
import cz.itnetwork.dto.StatisticsDTO;
import cz.itnetwork.service.InvoiceService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/invoices")
public class InvoiceController {

    private final InvoiceService invoiceService;

    public InvoiceController(InvoiceService invoiceService) {
        this.invoiceService = invoiceService;
    }

    /**
     * Vrátí seznam faktur s volitelným filtrováním.
     * Parametr limit omezuje počet výsledků – vhodné pro widgety na dashboardu.
     */
    @GetMapping
    public List<InvoiceDTO> getInvoices(
            @RequestParam(required = false) Long buyerId,
            @RequestParam(required = false) Long sellerId,
            @RequestParam(required = false) String product,
            @RequestParam(required = false) Long minPrice,
            @RequestParam(required = false) Long maxPrice,
            @RequestParam(required = false) Integer limit,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate issuedFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate issuedTo,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dueFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dueTo,
            @RequestParam(required = false) Boolean overdue
    ) {
        InvoiceFilterDTO filter = buildFilter(
                buyerId, sellerId, product, minPrice, maxPrice, limit,
                issuedFrom, issuedTo, dueFrom, dueTo, overdue
        );
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
    public InvoiceDTO addInvoice(@Valid @RequestBody InvoiceDTO invoiceDTO) {
        return invoiceService.addInvoice(invoiceDTO);
    }

    /**
     * Bulk create – vytvoří více faktur najednou.
     * Každá faktura projde stejnou Bean Validation i business validací jako při jednotlivém vytvoření.
     * Buyer a seller musí být existující osoby v DB (odkazujeme přes _id).
     * Pokud validace nebo lookup jakékoliv faktury selže, celý bulk se zastaví – žádná faktura se neuloží.
     */
    @PostMapping("/bulk")
    @ResponseStatus(HttpStatus.CREATED)
    public List<InvoiceDTO> addInvoicesBulk(@Valid @RequestBody List<@Valid InvoiceDTO> invoiceDTOs) {
        return invoiceService.addInvoicesBulk(invoiceDTOs);
    }

    @PutMapping("/{id}")
    public InvoiceDTO updateInvoice(@PathVariable Long id, @Valid @RequestBody InvoiceDTO invoiceDTO) {
        return invoiceService.updateInvoice(id, invoiceDTO);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteInvoice(@PathVariable Long id) {
        invoiceService.deleteInvoice(id);
    }

    // ── Private helpers ──────────────────────────────────────────────────────

    /** Sestaví filtrační DTO z query parametrů endpointu. */
    private InvoiceFilterDTO buildFilter(
            Long buyerId, Long sellerId, String product,
            Long minPrice, Long maxPrice, Integer limit,
            LocalDate issuedFrom, LocalDate issuedTo,
            LocalDate dueFrom, LocalDate dueTo, Boolean overdue
    ) {
        InvoiceFilterDTO filter = new InvoiceFilterDTO();
        filter.setBuyerId(buyerId);
        filter.setSellerId(sellerId);
        filter.setProduct(product);
        filter.setMinPrice(minPrice);
        filter.setMaxPrice(maxPrice);
        filter.setLimit(limit);
        filter.setIssuedFrom(issuedFrom);
        filter.setIssuedTo(issuedTo);
        filter.setDueFrom(dueFrom);
        filter.setDueTo(dueTo);
        filter.setOverdue(overdue);
        return filter;
    }
}
