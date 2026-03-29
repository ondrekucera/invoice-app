package cz.itnetwork.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class StatisticsDTO {

    private long invoiceCount;

    private long invoicesSum;

    private long invoicesAverage;

    // Nové pole v6
    private long totalWithVat;

    private long overdueCount;

    private long thisMonthCount;

    private long highestInvoice;
}
