package cz.itnetwork.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class InvoiceDTO {

    // Pole "_id" zachovává kompatibilitu s frontendem (React používá _id jako identifikátor)
    @JsonProperty("_id")
    private Long id;

    @NotNull(message = "Číslo faktury je povinné.")
    @Positive(message = "Číslo faktury musí být kladné.")
    private Integer invoiceNumber;

    @NotNull(message = "Datum vystavení je povinné.")
    private LocalDate issued;

    @NotNull(message = "Datum splatnosti je povinné.")
    private LocalDate dueDate;

    @NotBlank(message = "Produkt nesmí být prázdný.")
    private String product;

    @NotNull(message = "Cena je povinná.")
    @DecimalMin(value = "0.0", inclusive = true, message = "Cena nesmí být záporná.")
    private Long price;

    @NotNull(message = "DPH je povinné.")
    @DecimalMin(value = "0.0", inclusive = true, message = "DPH nesmí být záporné.")
    private Integer vat;

    private String note;

    // Buyer a seller jsou vnořené DTO – při validaci stačí @NotNull, detailní kontrola probíhá v service
    @NotNull(message = "Kupující je povinný.")
    private PersonDTO buyer;

    @NotNull(message = "Prodávající je povinný.")
    private PersonDTO seller;
}
