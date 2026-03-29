package cz.itnetwork.entity.repository;

import cz.itnetwork.dto.InvoiceFilterDTO;
import cz.itnetwork.entity.InvoiceEntity;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public class InvoiceSpecification {

    /**
     * Sestaví JPA Specification pro filtrování faktur.
     * Každý filtr je volitelný – null hodnoty jsou přeskočeny.
     * Výsledná podmínka je AND spojení všech aktivních filtrů.
     */
    public static Specification<InvoiceEntity> filterBy(InvoiceFilterDTO filter) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (filter == null) {
                // Žádný filtr – vrátíme všechny záznamy
                return cb.conjunction();
            }

            if (filter.getBuyerId() != null) {
                predicates.add(cb.equal(root.get("buyer").get("id"), filter.getBuyerId()));
            }
            if (filter.getSellerId() != null) {
                predicates.add(cb.equal(root.get("seller").get("id"), filter.getSellerId()));
            }
            if (filter.getProduct() != null && !filter.getProduct().isBlank()) {
                // Case-insensitive LIKE – hledá podřetězec kdekoliv v názvu produktu
                predicates.add(cb.like(
                        cb.lower(root.get("product")),
                        "%" + filter.getProduct().toLowerCase() + "%"
                ));
            }
            if (filter.getMinPrice() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("price"), filter.getMinPrice()));
            }
            if (filter.getMaxPrice() != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("price"), filter.getMaxPrice()));
            }
            if (filter.getIssuedFrom() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("issued"), filter.getIssuedFrom()));
            }
            if (filter.getIssuedTo() != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("issued"), filter.getIssuedTo()));
            }
            if (filter.getDueFrom() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("dueDate"), filter.getDueFrom()));
            }
            if (filter.getDueTo() != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("dueDate"), filter.getDueTo()));
            }
            if (Boolean.TRUE.equals(filter.getOverdue())) {
                // Faktura je po splatnosti, pokud dueDate < dnešní datum
                predicates.add(cb.lessThan(root.get("dueDate"), LocalDate.now()));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
