package cz.itnetwork.dto.mapper;

import cz.itnetwork.dto.PersonDTO;
import cz.itnetwork.entity.PersonEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface PersonMapper {

    @Mapping(target = "hidden", ignore = true)
    @Mapping(target = "purchases", ignore = true)
    @Mapping(target = "sales", ignore = true)
    PersonEntity toEntity(PersonDTO source);

    PersonDTO toDTO(PersonEntity source);
}