package cz.itnetwork.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class StatisticsDTO {

    private long invoiceCount;

    private BigDecimal invoicesSum;

    private BigDecimal invoicesAverage;

    private BigDecimal totalWithVat;

    private long overdueCount;

    private long thisMonthCount;

    private BigDecimal highestInvoice;
}
