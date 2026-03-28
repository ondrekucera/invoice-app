package cz.itnetwork.controller;

import cz.itnetwork.dto.PersonDTO;
import cz.itnetwork.service.PersonService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/persons")
public class PersonController {

    @Autowired
    private PersonService personService;

    @GetMapping
    public List<PersonDTO> getPersons() {
        return personService.getAll();
    }

    @GetMapping("/{id}")
    public PersonDTO getPersonById(@PathVariable Long id) {
        return personService.getPersonById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PersonDTO addPerson(@Valid @RequestBody PersonDTO personDTO) {
        return personService.addPerson(personDTO);
    }

    @PutMapping("/{id}")
    public PersonDTO updatePerson(@PathVariable Long id, @Valid @RequestBody PersonDTO personDTO) {
        return personService.updatePerson(id, personDTO);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deletePerson(@PathVariable Long id) {
        personService.removePerson(id);
    }
}
