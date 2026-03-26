package cz.itnetwork.controller;

import cz.itnetwork.dto.PersonDTO;
import cz.itnetwork.service.PersonService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller pro správu osob.
 *
 * Endpointy (testovatelné přes Postman):
 *   GET    /api/persons
 *   GET    /api/persons/{id}
 *   POST   /api/persons
 *   PUT    /api/persons/{id}
 *   DELETE /api/persons/{id}
 */
@RestController
@RequestMapping("/api/persons")
public class PersonController {

    @Autowired
    private PersonService personService;

    /** Výpis všech osob */
    @GetMapping
    public List<PersonDTO> getPersons() {
        return personService.getAll();
    }

    /** Detail osoby podle ID */
    @GetMapping("/{id}")
    public PersonDTO getPersonById(@PathVariable Long id) {
        return personService.getPersonById(id);
    }

    /** Vytvoření nové osoby (POST /api/persons) */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PersonDTO addPerson(@RequestBody PersonDTO personDTO) {
        return personService.addPerson(personDTO);
    }

    /** Úprava osoby (PUT /api/persons/{id}) */
    @PutMapping("/{id}")
    public PersonDTO updatePerson(@PathVariable Long id, @RequestBody PersonDTO personDTO) {
        return personService.updatePerson(id, personDTO);
    }

    /** Smazání osoby (soft-delete) */
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deletePerson(@PathVariable Long id) {
        personService.removePerson(id);
    }
}
