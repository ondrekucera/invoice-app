package cz.itnetwork.service;

import cz.itnetwork.dto.PersonDTO;
import cz.itnetwork.dto.PersonFilterDTO;
import cz.itnetwork.dto.PersonRevenueDTO;

import java.util.List;

public interface PersonService {

    PersonDTO addPerson(PersonDTO personDTO);

    /** Vytvoří více osob najednou. Vrátí seznam uložených DTO se přidělenými ID. */
    List<PersonDTO> addPersonsBulk(List<PersonDTO> personDTOs);

    void removePerson(long id);

    List<PersonDTO> getAll(PersonFilterDTO filter);

    PersonDTO getPersonById(long id);

    PersonDTO updatePerson(long id, PersonDTO personDTO);

    List<PersonRevenueDTO> getRevenueByYear(int year);
}
