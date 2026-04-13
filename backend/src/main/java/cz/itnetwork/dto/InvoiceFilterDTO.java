package cz.itnetwork.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
public class InvoiceFilterDTO {

    private Long buyerId;
    private Long sellerId;
    private String product;
    private BigDecimal minPrice;
    private BigDecimal maxPrice;
    private Integer limit;

    private LocalDate issuedFrom;
    private LocalDate issuedTo;
    private LocalDate dueFrom;
    private LocalDate dueTo;
    private Boolean overdue;
}
