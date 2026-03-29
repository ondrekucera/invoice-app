package cz.itnetwork.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PersonRevenueDTO {

    private Long personId;
    private String name;
    private String identificationNumber;
    private long revenue;
}
