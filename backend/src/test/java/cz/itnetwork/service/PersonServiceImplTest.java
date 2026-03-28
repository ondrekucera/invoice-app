package cz.itnetwork.service;

import cz.itnetwork.dto.PersonDTO;
import cz.itnetwork.dto.mapper.PersonMapper;
import cz.itnetwork.entity.PersonEntity;
import cz.itnetwork.entity.repository.PersonRepository;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PersonServiceImplTest {

    @Mock
    private PersonMapper personMapper;
    @Mock
    private PersonRepository personRepository;

    @InjectMocks
    private PersonServiceImpl personService;

    @Test
    void getAll_returnsOnlyVisiblePersons() {
        PersonEntity visible = new PersonEntity();
        visible.setHidden(false);
        when(personRepository.findByHidden(false)).thenReturn(List.of(visible));
        when(personMapper.toDTO(visible)).thenReturn(new PersonDTO());
        assertEquals(1, personService.getAll().size());
        verify(personRepository).findByHidden(false);
    }

    @Test
    void removePerson_setsHiddenTrue() {
        PersonEntity entity = new PersonEntity();
        entity.setHidden(false);
        when(personRepository.findById(1L)).thenReturn(Optional.of(entity));
        personService.removePerson(1L);
        assertTrue(entity.isHidden());
        verify(personRepository).save(entity);
    }

    @Test
    void removePerson_doesNotThrowWhenNotFound() {
        when(personRepository.findById(99L)).thenReturn(Optional.empty());
        assertDoesNotThrow(() -> personService.removePerson(99L));
    }

    @Test
    void getPersonById_throwsWhenNotFound() {
        when(personRepository.findById(42L)).thenReturn(Optional.empty());
        assertThrows(EntityNotFoundException.class, () -> personService.getPersonById(42L));
    }

    @Test
    void addPerson_savesAndReturnsDTO() {
        PersonDTO dto = new PersonDTO();
        PersonEntity entity = new PersonEntity();
        when(personMapper.toEntity(dto)).thenReturn(entity);
        when(personRepository.save(entity)).thenReturn(entity);
        when(personMapper.toDTO(entity)).thenReturn(dto);
        PersonDTO result = personService.addPerson(dto);
        assertNotNull(result);
        verify(personRepository).save(entity);
    }
}
