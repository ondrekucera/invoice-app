package cz.itnetwork.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class InvoiceDTO {

    @JsonProperty("_id")
    private Long id;

    private int invoiceNumber;

    private LocalDate issued;

    private LocalDate dueDate;

    private String product;

    private long price;

    private int vat;

    private String note;

    private PersonDTO buyer;

    private PersonDTO seller;
}
