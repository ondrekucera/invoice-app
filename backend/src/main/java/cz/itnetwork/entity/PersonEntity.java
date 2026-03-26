package cz.itnetwork.entity;

import cz.itnetwork.constant.Countries;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

/**
 * JPA entita – tabulka "person" v MySQL (XAMPP).
 * Tabulka se vytvoří automaticky díky ddl-auto=update.
 */
@Entity
@Table(name = "person")
@Getter
@Setter
public class PersonEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String identificationNumber;

    private String taxNumber;

    private String accountNumber;

    private String bankCode;

    private String iban;

    private String telephone;

    private String mail;

    private String street;

    private String zip;

    private String city;

    @Enumerated(EnumType.STRING)
    private Countries country;

    private String note;

    /** Soft-delete příznak – skrytá osoba se nevrací v listingu */
    @Column(nullable = false)
    private boolean hidden = false;
}
