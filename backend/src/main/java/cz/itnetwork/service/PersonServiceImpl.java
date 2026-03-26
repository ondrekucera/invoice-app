package cz.itnetwork.service;

import cz.itnetwork.dto.PersonDTO;
import cz.itnetwork.dto.mapper.PersonMapper;
import cz.itnetwork.entity.PersonEntity;
import cz.itnetwork.entity.repository.PersonRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

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
            // Dle kontraktu – žádná výjimka, pokud osoba neexistuje
        }
    }

    @Override
    public List<PersonDTO> getAll() {
        return personRepository.findByHidden(false)
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
        fetchPersonById(id); // ověření existence

        PersonEntity updated = personMapper.toEntity(personDTO);
        updated.setId(id);
        updated = personRepository.save(updated);

        return personMapper.toDTO(updated);
    }

    // region: Private helpers

    private PersonEntity fetchPersonById(long id) {
        return personRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Osoba s id " + id + " nebyla nalezena."));
    }

    // endregion
}
