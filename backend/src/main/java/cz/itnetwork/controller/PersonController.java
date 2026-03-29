package cz.itnetwork.controller;

import cz.itnetwork.constant.Countries;
import cz.itnetwork.constant.PersonCategory;
import cz.itnetwork.dto.PersonDTO;
import cz.itnetwork.dto.PersonFilterDTO;
import cz.itnetwork.dto.PersonRevenueDTO;
import cz.itnetwork.service.PersonService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/persons")
public class PersonController {

    @Autowired
    private PersonService personService;

    @GetMapping
    public List<PersonDTO> getPersons(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String identificationNumber,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) Countries country,
            @RequestParam(required = false) PersonCategory category
    ) {
        PersonFilterDTO filter = new PersonFilterDTO();
        filter.setName(name);
        filter.setIdentificationNumber(identificationNumber);
        filter.setCity(city);
        filter.setCountry(country);
        filter.setCategory(category);
        return personService.getAll(filter);
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

    // Firemní statistiky – obrat za daný rok (default: loňský rok)
    @GetMapping("/statistics/revenue")
    public List<PersonRevenueDTO> getPersonRevenue(
            @RequestParam(required = false) Integer year
    ) {
        int targetYear = (year != null) ? year : LocalDate.now().getYear() - 1;
        return personService.getRevenueByYear(targetYear);
    }
}
