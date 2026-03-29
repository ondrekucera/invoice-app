package cz.itnetwork.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import cz.itnetwork.constant.Countries;
import cz.itnetwork.constant.PersonCategory;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PersonDTO {

    // Pole "_id" zachovává kompatibilitu s frontendem (React používá _id jako identifikátor)
    @JsonProperty("_id")
    private Long id;

    @NotBlank(message = "Jméno nesmí být prázdné.")
    private String name;

    @NotBlank(message = "Identifikační číslo nesmí být prázdné.")
    private String identificationNumber;

    @Size(max = 20, message = "DIČ může mít nejvýše 20 znaků.")
    private String taxNumber;

    @Size(max = 30, message = "Číslo účtu může mít nejvýše 30 znaků.")
    private String accountNumber;

    @Size(max = 10, message = "Kód banky může mít nejvýše 10 znaků.")
    private String bankCode;

    @Size(max = 34, message = "IBAN může mít nejvýše 34 znaků.")
    private String iban;

    @Size(max = 20, message = "Telefon může mít nejvýše 20 znaků.")
    private String telephone;

    @Email(message = "E-mail musí mít platný formát.")
    private String mail;

    @Size(max = 100, message = "Ulice může mít nejvýše 100 znaků.")
    private String street;

    @Size(max = 10, message = "PSČ může mít nejvýše 10 znaků.")
    private String zip;

    @Size(max = 100, message = "Město může mít nejvýše 100 znaků.")
    private String city;

    private Countries country;

    @Size(max = 255, message = "Poznámka může mít nejvýše 255 znaků.")
    private String note;

    private PersonCategory category;
}
