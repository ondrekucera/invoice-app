package cz.itnetwork.controller;

import cz.itnetwork.dto.InvoiceDTO;
import cz.itnetwork.dto.InvoiceFilterDTO;
import cz.itnetwork.dto.PersonDTO;
import cz.itnetwork.dto.PersonFilterDTO;
import cz.itnetwork.service.InvoiceService;
import cz.itnetwork.service.PersonService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/export")
public class ExportController {

    private static final String UTF8_BOM = "\uFEFF"; // BOM pro správné otevření v MS Excel

    @Autowired
    private PersonService personService;

    @Autowired
    private InvoiceService invoiceService;

    // --- OSOBY ---

    @GetMapping("/persons/csv")
    public ResponseEntity<byte[]> exportPersonsCsv() {
        List<PersonDTO> persons = personService.getAll(new PersonFilterDTO());

        StringBuilder sb = new StringBuilder(UTF8_BOM);
        sb.append("id,jmeno,ico,dic,telefon,email,ulice,mesto,psc,zeme,kategorie,poznamka\n");
        for (PersonDTO p : persons) {
            sb.append(csv(p.getId())).append(",")
              .append(csv(p.getName())).append(",")
              .append(csv(p.getIdentificationNumber())).append(",")
              .append(csv(p.getTaxNumber())).append(",")
              .append(csv(p.getTelephone())).append(",")
              .append(csv(p.getMail())).append(",")
              .append(csv(p.getStreet())).append(",")
              .append(csv(p.getCity())).append(",")
              .append(csv(p.getZip())).append(",")
              .append(csv(p.getCountry())).append(",")
              .append(csv(p.getCategory())).append(",")
              .append(csv(p.getNote())).append("\n");
        }

        byte[] bytes = sb.toString().getBytes(java.nio.charset.StandardCharsets.UTF_8);
        String filename = "osoby-" + LocalDate.now() + ".csv";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .header(HttpHeaders.CACHE_CONTROL, "no-cache")
                .contentType(MediaType.parseMediaType("text/csv; charset=UTF-8"))
                .body(bytes);
    }

    // --- FAKTURY ---

    @GetMapping("/invoices/csv")
    public ResponseEntity<byte[]> exportInvoicesCsv() {
        List<InvoiceDTO> invoices = invoiceService.getAll(new InvoiceFilterDTO());

        StringBuilder sb = new StringBuilder(UTF8_BOM);
        sb.append("id,cislo,vystaveno,splatnost,produkt,cena,dph,dodavatel_ico,dodavatel,odberatel_ico,odberatel,poznamka\n");
        for (InvoiceDTO i : invoices) {
            sb.append(csv(i.getId())).append(",")
              .append(csv(i.getInvoiceNumber())).append(",")
              .append(csv(i.getIssued())).append(",")
              .append(csv(i.getDueDate())).append(",")
              .append(csv(i.getProduct())).append(",")
              .append(csv(i.getPrice())).append(",")
              .append(csv(i.getVat())).append(",")
              .append(csv(i.getSeller() != null ? i.getSeller().getIdentificationNumber() : "")).append(",")
              .append(csv(i.getSeller() != null ? i.getSeller().getName() : "")).append(",")
              .append(csv(i.getBuyer()  != null ? i.getBuyer().getIdentificationNumber()  : "")).append(",")
              .append(csv(i.getBuyer()  != null ? i.getBuyer().getName()  : "")).append(",")
              .append(csv(i.getNote())).append("\n");
        }

        byte[] bytes = sb.toString().getBytes(java.nio.charset.StandardCharsets.UTF_8);
        String filename = "faktury-" + LocalDate.now() + ".csv";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .header(HttpHeaders.CACHE_CONTROL, "no-cache")
                .contentType(MediaType.parseMediaType("text/csv; charset=UTF-8"))
                .body(bytes);
    }

    // --- helpers ---

    private String csv(Object value) {
        if (value == null) return "";
        String s = value.toString();
        if (s.contains(",") || s.contains("\"") || s.contains("\n") || s.contains("\r")) {
            return "\"" + s.replace("\"", "\"\"") + "\"";
        }
        return s;
    }
}
