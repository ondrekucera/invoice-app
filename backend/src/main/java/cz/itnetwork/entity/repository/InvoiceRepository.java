package cz.itnetwork.entity.repository;

import cz.itnetwork.entity.InvoiceEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface InvoiceRepository extends JpaRepository<InvoiceEntity, Long>,
        JpaSpecificationExecutor<InvoiceEntity> {

    List<InvoiceEntity> findBySellerId(long sellerId);

    List<InvoiceEntity> findByBuyerId(long buyerId);

    @Query("SELECT COUNT(i) FROM InvoiceEntity i")
    long countAll();

    @Query("SELECT COALESCE(SUM(i.price), 0) FROM InvoiceEntity i")
    long sumAllPrices();

    /**
     * Vrátí součet cen včetně DPH jako double.
     * Používá výpočet (price * (1 + vat/100)) přímo v SQL – bezpečné přes double,
     * výsledek se zaokrouhlí na celé Kč v service vrstvě.
     */
    @Query("SELECT COALESCE(SUM(i.price * (1.0 + i.vat / 100.0)), 0) FROM InvoiceEntity i")
    double sumAllPricesWithVatRaw();

    @Query("SELECT COUNT(i) FROM InvoiceEntity i WHERE i.dueDate < :today")
    long countOverdue(@Param("today") LocalDate today);

    /**
     * Počítá faktury vystavené v daném měsíci.
     * Používá BETWEEN s LocalDate místo YEAR()/MONTH() – přenositelné mezi DB dialekty.
     */
    @Query("SELECT COUNT(i) FROM InvoiceEntity i WHERE i.issued >= :from AND i.issued <= :to")
    long countInPeriod(@Param("from") LocalDate from, @Param("to") LocalDate to);

    @Query("SELECT COALESCE(MAX(i.price), 0) FROM InvoiceEntity i")
    long maxPrice();
}
