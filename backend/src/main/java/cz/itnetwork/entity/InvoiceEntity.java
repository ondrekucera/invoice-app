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
    private Long id;

    // Wrapper typy (Integer/Long) místo primitivů – Jackson dokáže deserializovat null/prázdný string
    // bez MismatchedInputException. NOT NULL constraint v DB zajistí @Column(nullable = false).
    @Column(nullable = false)
    private Integer invoiceNumber;

    private LocalDate issued;

    private LocalDate dueDate;

    private String product;

    @Column(nullable = false)
    private Long price;

    @Column(nullable = false)
    private Integer vat;

    private String note;

    @ManyToOne
    private PersonEntity buyer;

    @ManyToOne
    private PersonEntity seller;
}
