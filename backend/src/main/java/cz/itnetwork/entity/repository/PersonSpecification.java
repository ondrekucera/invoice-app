package cz.itnetwork.entity.repository;

import cz.itnetwork.dto.PersonFilterDTO;
import cz.itnetwork.entity.PersonEntity;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

public class PersonSpecification {

    public static Specification<PersonEntity> filterBy(PersonFilterDTO filter) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Pouze viditelné osoby (soft delete)
            predicates.add(cb.isFalse(root.get("hidden")));

            if (filter == null) return cb.and(predicates.toArray(new Predicate[0]));

            if (filter.getName() != null && !filter.getName().isBlank()) {
                predicates.add(cb.like(cb.lower(root.get("name")),
                        "%" + filter.getName().toLowerCase() + "%"));
            }
            if (filter.getIdentificationNumber() != null && !filter.getIdentificationNumber().isBlank()) {
                predicates.add(cb.like(root.get("identificationNumber"),
                        "%" + filter.getIdentificationNumber() + "%"));
            }
            if (filter.getCity() != null && !filter.getCity().isBlank()) {
                predicates.add(cb.like(cb.lower(root.get("city")),
                        "%" + filter.getCity().toLowerCase() + "%"));
            }
            if (filter.getCountry() != null) {
                predicates.add(cb.equal(root.get("country"), filter.getCountry()));
            }
            if (filter.getCategory() != null) {
                predicates.add(cb.equal(root.get("category"), filter.getCategory()));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
