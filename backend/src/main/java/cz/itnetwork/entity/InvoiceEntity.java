package cz.itnetwork.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Table(name = "invoice")
@Getter
@Setter
public class InvoiceEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    private int invoiceNumber;

    private LocalDate issued;

    private LocalDate dueDate;

    private String product;

    private long price;

    private int vat;

    private String note;

    @ManyToOne
    private PersonEntity buyer;

    @ManyToOne
    private PersonEntity seller;
}
