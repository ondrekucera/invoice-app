package cz.itnetwork.controller;

import cz.itnetwork.constant.Countries;
import cz.itnetwork.constant.PersonCategory;
import cz.itnetwork.dto.PersonDTO;
import cz.itnetwork.dto.PersonFilterDTO;
import cz.itnetwork.dto.PersonRevenueDTO;
import cz.itnetwork.service.PersonService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/persons")
@Tag(name = "Osoby", description = "Správa osob (dodavatelů a odběratelů) – vytváření, editace, filtrování a soft delete.")
public class PersonController {

    private final PersonService personService;

    public PersonController(PersonService personService) {
        this.personService = personService;
    }

    @Operation(
            summary = "Seznam osob s filtrováním",
            description = "Vrátí všechny ne-skryté osoby v evidenci. Podporuje filtrování podle jména, IČO, města, země a kategorie."
    )
    @GetMapping
    public List<PersonDTO> getPersons(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String identificationNumber,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) Countries country,
            @RequestParam(required = false) PersonCategory category
    ) {
        PersonFilterDTO filter = buildFilter(name, identificationNumber, city, country, category);
        return personService.getAll(filter);
    }

    @Operation(
            summary = "Detail osoby podle ID",
            description = "Vrátí osobu s daným ID. Pokud osoba neexistuje nebo byla soft-deleted, vrátí 404."
    )
    @GetMapping("/{id}")
    public PersonDTO getPersonById(@PathVariable Long id) {
        return personService.getPersonById(id);
    }

    @Operation(
            summary = "Vytvoření nové osoby",
            description = "Vytvoří novou osobu. IČO musí být unikátní napříč celou evidencí (i mezi smazanými)."
    )
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PersonDTO addPerson(@Valid @RequestBody PersonDTO personDTO) {
        return personService.addPerson(personDTO);
    }

    /**
     * Bulk create – vytvoří více osob najednou.
     * Každá položka seznamu projde stejnou Bean Validation jako při jednotlivém vytvoření.
     * Vrátí seznam uložených osob se přidělenými ID.
     */
    @Operation(
            summary = "Hromadné vytvoření osob",
            description = "Vytvoří více osob najednou v jedné transakci. Pokud jedna z osob selže validaci, celá dávka se neuloží."
    )
    @PostMapping("/bulk")
    @ResponseStatus(HttpStatus.CREATED)
    public List<PersonDTO> addPersonsBulk(@Valid @RequestBody List<@Valid PersonDTO> personDTOs) {
        return personService.addPersonsBulk(personDTOs);
    }

    @Operation(
            summary = "Aktualizace osoby",
            description = "Aktualizuje existující osobu. Všechna pole se přepisují hodnotami z požadavku."
    )
    @PutMapping("/{id}")
    public PersonDTO updatePerson(@PathVariable Long id, @Valid @RequestBody PersonDTO personDTO) {
        return personService.updatePerson(id, personDTO);
    }

    /**
     * Soft delete – osoba se označí jako hidden, data zůstávají v DB.
     * Zachovává historii faktur navázaných na tuto osobu.
     */
    @Operation(
            summary = "Smazání osoby (soft delete)",
            description = "Označí osobu jako skrytou. Data zůstávají v DB pro zachování historie faktur."
    )
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deletePerson(@PathVariable Long id) {
        personService.removePerson(id);
    }

    /**
     * Vrátí obrat osob (jako prodávající) za daný rok.
     * Výchozí hodnota je loňský rok – typický případ pro účetní přehledy.
     */
    @Operation(
            summary = "Obrat osob za rok",
            description = "Vrátí přehled obratu osob (jako prodávajících) za zadaný rok. Pokud rok není uveden, použije se loňský rok."
    )
    @GetMapping("/statistics/revenue")
    public List<PersonRevenueDTO> getPersonRevenue(@RequestParam(required = false) Integer year) {
        int targetYear = (year != null) ? year : LocalDate.now().getYear() - 1;
        return personService.getRevenueByYear(targetYear);
    }

    // ── Private helpers ──────────────────────────────────────────────────────

    /** Sestaví filtrační DTO z query parametrů endpointu. */
    private PersonFilterDTO buildFilter(
            String name, String identificationNumber,
            String city, Countries country, PersonCategory category
    ) {
        PersonFilterDTO filter = new PersonFilterDTO();
        filter.setName(name);
        filter.setIdentificationNumber(identificationNumber);
        filter.setCity(city);
        filter.setCountry(country);
        filter.setCategory(category);
        return filter;
    }
}
