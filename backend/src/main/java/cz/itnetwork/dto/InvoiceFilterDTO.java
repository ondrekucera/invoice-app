package cz.itnetwork.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
public class InvoiceFilterDTO {

    private Long buyerId;
    private Long sellerId;
    private String product;
    private Long minPrice;
    private Long maxPrice;
    private Integer limit;

    private LocalDate issuedFrom;
    private LocalDate issuedTo;
    private LocalDate dueFrom;
    private LocalDate dueTo;
    private Boolean overdue;
}
