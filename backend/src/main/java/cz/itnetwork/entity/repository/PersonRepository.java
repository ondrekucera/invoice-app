package cz.itnetwork.entity.repository;

import cz.itnetwork.entity.PersonEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface PersonRepository extends JpaRepository<PersonEntity, Long>,
        JpaSpecificationExecutor<PersonEntity> {

    List<PersonEntity> findByHidden(boolean hidden);

    /**
     * Obrat firem (jako prodávající) za dané období.
     * Používá BETWEEN s LocalDate – přenositelné bez YEAR().
     * Osoby bez faktur mají revenue = 0 (LEFT JOIN).
     */
    @Query("""
        SELECT p.id, p.name, p.identificationNumber, COALESCE(SUM(i.price), 0)
        FROM PersonEntity p
        LEFT JOIN p.sales i
        WHERE p.hidden = false
          AND (i.id IS NULL OR (i.issued >= :from AND i.issued <= :to))
        GROUP BY p.id, p.name, p.identificationNumber
        ORDER BY COALESCE(SUM(i.price), 0) DESC
        """)
    List<Object[]> findPersonRevenueByYear(
            @Param("from") LocalDate from,
            @Param("to")   LocalDate to
    );
}
