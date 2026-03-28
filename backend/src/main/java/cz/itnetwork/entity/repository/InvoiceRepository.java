package cz.itnetwork.entity.repository;

import cz.itnetwork.entity.InvoiceEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface InvoiceRepository extends JpaRepository<InvoiceEntity, Long>,
        JpaSpecificationExecutor<InvoiceEntity> {

    List<InvoiceEntity> findBySellerId(long sellerId);

    List<InvoiceEntity> findByBuyerId(long buyerId);

    @Query("SELECT COUNT(i) FROM InvoiceEntity i")
    long countAll();

    @Query("SELECT COALESCE(SUM(i.price), 0) FROM InvoiceEntity i")
    long sumAllPrices();
}
