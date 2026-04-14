package cz.itnetwork.dto.mapper;

import cz.itnetwork.dto.ExpenseDTO;
import cz.itnetwork.entity.ExpenseEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ExpenseMapper {

    @Mapping(target = "hidden", ignore = true)
    ExpenseEntity toEntity(ExpenseDTO source);

    ExpenseDTO toDTO(ExpenseEntity source);
}
