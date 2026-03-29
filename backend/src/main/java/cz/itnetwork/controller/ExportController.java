package cz.itnetwork.controller;

import cz.itnetwork.dto.InvoiceDTO;
import cz.itnetwork.dto.PersonDTO;
import cz.itnetwork.dto.InvoiceFilterDTO;
import cz.itnetwork.dto.PersonFilterDTO;
import cz.itnetwork.service.InvoiceService;
import cz.itnetwork.service.PersonService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/export")
public class ExportController {

    /** UTF-8 BOM ensures correct encoding when opening in MS Excel. */
    private static final String UTF8_BOM = "\uFEFF";

    private final PersonService personService;
    private final InvoiceService invoiceService;

    public ExportController(PersonService personService, InvoiceService invoiceService) {
        this.personService  = personService;
        this.invoiceService = invoiceService;
    }

    @GetMapping("/persons/csv")
    public ResponseEntity<byte[]> exportPersonsCsv() {
        List<PersonDTO> persons = personService.getAll(new PersonFilterDTO());

        StringBuilder csv = new StringBuilder(UTF8_BOM);
        csv.append("id,jmeno,ico,dic,telefon,email,ulice,mesto,psc,zeme,kategorie,poznamka\n");

        for (PersonDTO p : persons) {
            csv.append(escapeCsvField(p.getId())).append(",")
               .append(escapeCsvField(p.getName())).append(",")
               .append(escapeCsvField(p.getIdentificationNumber())).append(",")
               .append(escapeCsvField(p.getTaxNumber())).append(",")
               .append(escapeCsvField(p.getTelephone())).append(",")
               .append(escapeCsvField(p.getMail())).append(",")
               .append(escapeCsvField(p.getStreet())).append(",")
               .append(escapeCsvField(p.getCity())).append(",")
               .append(escapeCsvField(p.getZip())).append(",")
               .append(escapeCsvField(p.getCountry())).append(",")
               .append(escapeCsvField(p.getCategory())).append(",")
               .append(escapeCsvField(p.getNote())).append("\n");
        }

        return buildCsvResponse(csv.toString(), "osoby-" + LocalDate.now() + ".csv");
    }

    @GetMapping("/invoices/csv")
    public ResponseEntity<byte[]> exportInvoicesCsv() {
        List<InvoiceDTO> invoices = invoiceService.getAll(new InvoiceFilterDTO());

        StringBuilder csv = new StringBuilder(UTF8_BOM);
        csv.append("id,cislo,vystaveno,splatnost,produkt,cena,dph,dodavatel_ico,dodavatel,odberatel_ico,odberatel,poznamka\n");

        for (InvoiceDTO i : invoices) {
            csv.append(escapeCsvField(i.getId())).append(",")
               .append(escapeCsvField(i.getInvoiceNumber())).append(",")
               .append(escapeCsvField(i.getIssued())).append(",")
               .append(escapeCsvField(i.getDueDate())).append(",")
               .append(escapeCsvField(i.getProduct())).append(",")
               .append(escapeCsvField(i.getPrice())).append(",")
               .append(escapeCsvField(i.getVat())).append(",")
               .append(escapeCsvField(i.getSeller() != null ? i.getSeller().getIdentificationNumber() : "")).append(",")
               .append(escapeCsvField(i.getSeller() != null ? i.getSeller().getName() : "")).append(",")
               .append(escapeCsvField(i.getBuyer()  != null ? i.getBuyer().getIdentificationNumber()  : "")).append(",")
               .append(escapeCsvField(i.getBuyer()  != null ? i.getBuyer().getName()  : "")).append(",")
               .append(escapeCsvField(i.getNote())).append("\n");
        }

        return buildCsvResponse(csv.toString(), "faktury-" + LocalDate.now() + ".csv");
    }

    // ── Private helpers ──────────────────────────────────────────────────────

    /**
     * Builds a CSV download response with correct headers and UTF-8 encoding.
     */
    private ResponseEntity<byte[]> buildCsvResponse(String csvContent, String filename) {
        byte[] bytes = csvContent.getBytes(StandardCharsets.UTF_8);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .header(HttpHeaders.CACHE_CONTROL, "no-cache")
                .contentType(MediaType.parseMediaType("text/csv; charset=UTF-8"))
                .body(bytes);
    }

    /**
     * Escapes a value for RFC 4180 CSV output.
     * Wraps fields containing commas, quotes, or line breaks in double quotes.
     */
    private String escapeCsvField(Object value) {
        if (value == null) return "";
        String text = value.toString();
        if (text.contains(",") || text.contains("\"") || text.contains("\n") || text.contains("\r")) {
            return "\"" + text.replace("\"", "\"\"") + "\"";
        }
        return text;
    }
}
