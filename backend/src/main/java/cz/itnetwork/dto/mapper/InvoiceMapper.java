package cz.itnetwork.dto.mapper;

import cz.itnetwork.dto.InvoiceDTO;
import cz.itnetwork.entity.InvoiceEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = {PersonMapper.class})
public interface InvoiceMapper {

    InvoiceDTO toDTO(InvoiceEntity source);

    @Mapping(source = "buyer.id", target = "buyer.id")
    @Mapping(source = "seller.id", target = "seller.id")
    InvoiceEntity toEntity(InvoiceDTO source);
}
