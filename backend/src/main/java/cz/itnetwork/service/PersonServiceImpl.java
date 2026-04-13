package cz.itnetwork.service;

import cz.itnetwork.dto.PersonDTO;
import cz.itnetwork.dto.PersonFilterDTO;
import cz.itnetwork.dto.PersonRevenueDTO;
import cz.itnetwork.dto.mapper.PersonMapper;
import cz.itnetwork.entity.PersonEntity;
import cz.itnetwork.entity.repository.PersonRepository;
import cz.itnetwork.entity.repository.PersonSpecification;
import cz.itnetwork.exception.BusinessException;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

// Class-level @Transactional – všechny public metody běží v transakci.
// Read-only metody přepisují default pomocí readOnly = true (optimalizace: Hibernate nespouští dirty checking).
@Service
@Transactional
public class PersonServiceImpl implements PersonService {

    private final PersonMapper personMapper;
    private final PersonRepository personRepository;

    public PersonServiceImpl(PersonMapper personMapper, PersonRepository personRepository) {
        this.personMapper     = personMapper;
        this.personRepository = personRepository;
    }

    @Override
    public PersonDTO addPerson(PersonDTO personDTO) {
        PersonEntity entity = personRepository.save(personMapper.toEntity(personDTO));
        return personMapper.toDTO(entity);
    }

    @Override
    public List<PersonDTO> addPersonsBulk(List<PersonDTO> personDTOs) {
        if (personDTOs == null || personDTOs.isEmpty()) {
            throw new BusinessException("Seznam osob nesmí být prázdný.");
        }

        // Mapujeme celý list na entity a uložíme v jedné DB transakci
        List<PersonEntity> entities = personDTOs.stream()
                .map(personMapper::toEntity)
                .collect(Collectors.toList());

        List<PersonEntity> saved = personRepository.saveAll(entities);

        return saved.stream()
                .map(personMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public void removePerson(long id) {
        try {
            PersonEntity person = fetchPersonById(id);
            // Soft delete – osoba zůstává v DB kvůli historii faktur, pouze se skryje z výpisů
            person.setHidden(true);
            personRepository.save(person);
        } catch (EntityNotFoundException ignored) {
            // Operace je idempotentní – opakované smazání neexistující osoby není chyba
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<PersonDTO> getAll(PersonFilterDTO filter) {
        Specification<PersonEntity> spec = PersonSpecification.filterBy(filter);
        return personRepository.findAll(spec)
                .stream()
                .map(personMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public PersonDTO getPersonById(long id) {
        return personMapper.toDTO(fetchPersonById(id));
    }

    @Override
    public PersonDTO updatePerson(long id, PersonDTO personDTO) {
        PersonEntity existing = fetchPersonById(id);

        PersonEntity updated = personMapper.toEntity(personDTO);
        // ID a hidden přiřazujeme explicitně – mapper je z DTO nepřenáší
        updated.setId(id);
        updated.setHidden(existing.isHidden());

        return personMapper.toDTO(personRepository.save(updated));
    }

    @Override
    @Transactional(readOnly = true)
    public List<PersonRevenueDTO> getRevenueByYear(int year) {
        LocalDate from = LocalDate.of(year, 1, 1);
        LocalDate to   = LocalDate.of(year, 12, 31);

        return personRepository.findPersonRevenueByYear(from, to)
                .stream()
                .map(this::mapToPersonRevenueDTO)
                .collect(Collectors.toList());
    }

    // ── Private helpers ──────────────────────────────────────────────────────

    /** Načte osobu nebo vyhodí 404. Centralizuje opakující se lookup vzor. */
    private PersonEntity fetchPersonById(long id) {
        return personRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Osoba s id " + id + " nebyla nalezena."
                ));
    }

    /**
     * Mapuje raw řádek z JPQL projekce na typovaný DTO.
     * Pořadí sloupců odpovídá SELECT v PersonRepository.findPersonRevenueByYear.
     */
    private PersonRevenueDTO mapToPersonRevenueDTO(Object[] row) {
        return new PersonRevenueDTO(
                ((Number) row[0]).longValue(), // id
                (String)  row[1],              // name
                (String)  row[2],              // identificationNumber
                (BigDecimal) row[3]            // revenue (SUM)
        );
    }
}
