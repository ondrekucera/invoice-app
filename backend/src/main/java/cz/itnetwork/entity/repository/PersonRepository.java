package cz.itnetwork.entity.repository;

import cz.itnetwork.entity.PersonEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/**
 * Spring Data JPA repository pro PersonEntity.
 * Metoda findByHidden vrátí pouze viditelné (hidden=false) osoby.
 */
public interface PersonRepository extends JpaRepository<PersonEntity, Long> {

    List<PersonEntity> findByHidden(boolean hidden);
}
