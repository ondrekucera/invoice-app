package cz.itnetwork.dto;

import lombok.Data;

@Data
public class InvoiceFilterDTO {

    private Long buyerId;
    private Long sellerId;
    private String product;
    private Long minPrice;
    private Long maxPrice;
    private Integer limit;
}
