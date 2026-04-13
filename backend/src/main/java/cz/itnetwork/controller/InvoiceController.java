package cz.itnetwork.controller;

import cz.itnetwork.dto.InvoiceDTO;
import cz.itnetwork.dto.InvoiceFilterDTO;
import cz.itnetwork.dto.StatisticsDTO;
import cz.itnetwork.service.InvoiceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/invoices")
@Tag(name = "Faktury", description = "Správa faktur – vytváření, filtrování podle různých kritérií, agregované statistiky.")
public class InvoiceController {

    private final InvoiceService invoiceService;

    public InvoiceController(InvoiceService invoiceService) {
        this.invoiceService = invoiceService;
    }

    /**
     * Vrátí seznam faktur s volitelným filtrováním.
     * Parametr limit omezuje počet výsledků – vhodné pro widgety na dashboardu.
     */
    @Operation(
            summary = "Seznam faktur s filtrováním",
            description = "Vrátí faktury s volitelnými filtry (osoby, cena, data, splatnost). Parametr limit omezuje výsledek – vhodné pro widgety."
    )
    @GetMapping
    public List<InvoiceDTO> getInvoices(@ModelAttribute InvoiceFilterDTO filter) {
        return invoiceService.getAll(filter);
    }

    @Operation(
            summary = "Agregované statistiky faktur",
            description = "Vrátí celkový součet, průměrnou hodnotu, počet faktur, součet s DPH, počet po splatnosti, nejvyšší fakturu a počet faktur za aktuální měsíc."
    )
    @GetMapping("/statistics")
    public StatisticsDTO getStatistics() {
        return invoiceService.getStatistics();
    }

    @Operation(
            summary = "Detail faktury podle ID",
            description = "Vrátí fakturu s daným ID včetně informací o prodávajícím a kupujícím."
    )
    @GetMapping("/{id}")
    public InvoiceDTO getInvoiceById(@PathVariable Long id) {
        return invoiceService.getInvoiceById(id);
    }

    @Operation(
            summary = "Vystavené faktury osoby",
            description = "Vrátí všechny faktury, kde daná osoba figuruje jako prodávající."
    )
    @GetMapping("/sales/{personId}")
    public List<InvoiceDTO> getSalesByPersonId(@PathVariable Long personId) {
        return invoiceService.getSalesByPersonId(personId);
    }

    @Operation(
            summary = "Přijaté faktury osoby",
            description = "Vrátí všechny faktury, kde daná osoba figuruje jako kupující."
    )
    @GetMapping("/purchases/{personId}")
    public List<InvoiceDTO> getPurchasesByPersonId(@PathVariable Long personId) {
        return invoiceService.getPurchasesByPersonId(personId);
    }

    @Operation(
            summary = "Vytvoření nové faktury",
            description = "Vytvoří fakturu. Prodávající i kupující musí existovat. Datum splatnosti nesmí být před datem vystavení."
    )
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
    @Operation(
            summary = "Hromadné vytvoření faktur",
            description = "Vytvoří více faktur v jedné transakci. Při selhání validace jedné faktury se celá dávka neuloží."
    )
    @PostMapping("/bulk")
    @ResponseStatus(HttpStatus.CREATED)
    public List<InvoiceDTO> addInvoicesBulk(@Valid @RequestBody List<@Valid InvoiceDTO> invoiceDTOs) {
        return invoiceService.addInvoicesBulk(invoiceDTOs);
    }

    @Operation(
            summary = "Aktualizace faktury",
            description = "Aktualizuje existující fakturu. Metadata jako ID a datum vytvoření zůstávají zachována."
    )
    @PutMapping("/{id}")
    public InvoiceDTO updateInvoice(@PathVariable Long id, @Valid @RequestBody InvoiceDTO invoiceDTO) {
        return invoiceService.updateInvoice(id, invoiceDTO);
    }

    @Operation(
            summary = "Smazání faktury",
            description = "Trvale odstraní fakturu z evidence."
    )
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteInvoice(@PathVariable Long id) {
        invoiceService.deleteInvoice(id);
    }

}
