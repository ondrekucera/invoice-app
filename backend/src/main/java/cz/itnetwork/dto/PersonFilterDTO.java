package cz.itnetwork.dto;

import cz.itnetwork.constant.Countries;
import cz.itnetwork.constant.PersonCategory;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class PersonFilterDTO {

    private String name;
    private String identificationNumber;
    private String city;
    private Countries country;
    private PersonCategory category;
}
