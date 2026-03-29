package cz.itnetwork.service;

import cz.itnetwork.dto.PersonDTO;
import cz.itnetwork.dto.PersonFilterDTO;
import cz.itnetwork.dto.PersonRevenueDTO;
import cz.itnetwork.dto.mapper.PersonMapper;
import cz.itnetwork.entity.PersonEntity;
import cz.itnetwork.entity.repository.PersonRepository;
import cz.itnetwork.entity.repository.PersonSpecification;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PersonServiceImpl implements PersonService {

    @Autowired
    private PersonMapper personMapper;

    @Autowired
    private PersonRepository personRepository;

    @Override
    public PersonDTO addPerson(PersonDTO personDTO) {
        PersonEntity entity = personMapper.toEntity(personDTO);
        entity = personRepository.save(entity);
        return personMapper.toDTO(entity);
    }

    @Override
    public void removePerson(long id) {
        try {
            PersonEntity person = fetchPersonById(id);
            person.setHidden(true);
            personRepository.save(person);
        } catch (EntityNotFoundException ignored) {
        }
    }

    @Override
    public List<PersonDTO> getAll(PersonFilterDTO filter) {
        Specification<PersonEntity> spec = PersonSpecification.filterBy(filter);
        return personRepository.findAll(spec)
                .stream()
                .map(personMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public PersonDTO getPersonById(long id) {
        return personMapper.toDTO(fetchPersonById(id));
    }

    @Override
    public PersonDTO updatePerson(long id, PersonDTO personDTO) {
        PersonEntity existing = fetchPersonById(id);

        PersonEntity updated = personMapper.toEntity(personDTO);
        updated.setId(id);
        updated.setHidden(existing.isHidden());
        updated = personRepository.save(updated);

        return personMapper.toDTO(updated);
    }

    @Override
    public List<PersonRevenueDTO> getRevenueByYear(int year) {
        LocalDate from = LocalDate.of(year, 1, 1);
        LocalDate to   = LocalDate.of(year, 12, 31);

        return personRepository.findPersonRevenueByYear(from, to)
                .stream()
                .map(row -> new PersonRevenueDTO(
                        ((Number) row[0]).longValue(),
                        (String) row[1],
                        (String) row[2],
                        ((Number) row[3]).longValue()
                ))
                .collect(Collectors.toList());
    }

    private PersonEntity fetchPersonById(long id) {
        return personRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Osoba s id " + id + " nebyla nalezena."));
    }
}
