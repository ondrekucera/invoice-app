package cz.itnetwork.entity;

import cz.itnetwork.constant.Countries;
import cz.itnetwork.constant.PersonCategory;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

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

    @Enumerated(EnumType.STRING)
    private PersonCategory category;

    @Column(nullable = false)
    private boolean hidden = false;

    @OneToMany(mappedBy = "buyer")
    private List<InvoiceEntity> purchases;

    @OneToMany(mappedBy = "seller")
    private List<InvoiceEntity> sales;
}
