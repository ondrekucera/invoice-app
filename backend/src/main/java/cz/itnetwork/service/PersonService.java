package cz.itnetwork.service;

import cz.itnetwork.dto.PersonDTO;

import java.util.List;

/**
 * Servisní vrstva pro správu osob.
 */
public interface PersonService {

    /** Vytvoří novou osobu a vrátí ji. */
    PersonDTO addPerson(PersonDTO personDTO);

    /** Soft-delete – nastaví hidden=true. Pokud osoba neexistuje, tiše selže. */
    void removePerson(long id);

    /** Vrátí seznam všech viditelných osob (hidden=false). */
    List<PersonDTO> getAll();

    /** Vrátí detail osoby podle ID. Vyhodí výjimku, pokud neexistuje. */
    PersonDTO getPersonById(long id);

    /** Aktualizuje existující osobu. Vyhodí výjimku, pokud neexistuje. */
    PersonDTO updatePerson(long id, PersonDTO personDTO);
}
