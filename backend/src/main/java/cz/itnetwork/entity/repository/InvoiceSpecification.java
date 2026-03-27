package cz.itnetwork.entity.repository;

import cz.itnetwork.dto.InvoiceFilterDTO;
import cz.itnetwork.entity.InvoiceEntity;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

public class InvoiceSpecification {

    public static Specification<InvoiceEntity> filterBy(InvoiceFilterDTO filter) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (filter.getBuyerId() != null) {
                predicates.add(cb.equal(root.get("buyer").get("id"), filter.getBuyerId()));
            }
            if (filter.getSellerId() != null) {
                predicates.add(cb.equal(root.get("seller").get("id"), filter.getSellerId()));
            }
            if (filter.getProduct() != null && !filter.getProduct().isBlank()) {
                predicates.add(cb.like(cb.lower(root.get("product")),
                        "%" + filter.getProduct().toLowerCase() + "%"));
            }
            if (filter.getMinPrice() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("price"), filter.getMinPrice()));
            }
            if (filter.getMaxPrice() != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("price"), filter.getMaxPrice()));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
