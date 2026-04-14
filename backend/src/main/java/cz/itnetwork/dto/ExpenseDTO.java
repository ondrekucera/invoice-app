package cz.itnetwork.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ExpenseDTO {

    @JsonProperty("_id")
    private Long id;

    @NotNull(message = "Datum je povinné.")
    private LocalDate date;

    @NotNull(message = "Částka je povinná.")
    @DecimalMin(value = "0.0", inclusive = true, message = "Částka nesmí být záporná.")
    @Digits(integer = 17, fraction = 2, message = "Částka může mít nejvýše 17 celých číslic a 2 desetinná místa.")
    private BigDecimal amount;

    @NotBlank(message = "Popis nesmí být prázdný.")
    @Size(max = 255, message = "Popis může mít nejvýše 255 znaků.")
    private String description;
}
