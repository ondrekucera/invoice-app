package cz.itnetwork.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PersonRevenueDTO {

    private Long personId;
    private String name;
    private String identificationNumber;
    private BigDecimal revenue;
}
