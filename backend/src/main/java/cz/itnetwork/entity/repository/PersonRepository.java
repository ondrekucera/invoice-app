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
     * Vrátí obrat osob (jako prodávající) za zadané období seřazený sestupně.
     *
     * LEFT JOIN zajišťuje, že osoby bez faktur mají revenue = 0 (nejsou vynechány).
     * Podmínka (i.id IS NULL OR ...) zachovává osoby bez faktur i při filtrování období.
     * Používá LocalDate BETWEEN místo YEAR()/MONTH() pro přenositelnost mezi DB dialekty.
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
