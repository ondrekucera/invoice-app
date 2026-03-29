package cz.itnetwork.service;

import cz.itnetwork.dto.PersonDTO;
import cz.itnetwork.dto.PersonFilterDTO;
import cz.itnetwork.dto.mapper.PersonMapper;
import cz.itnetwork.entity.PersonEntity;
import cz.itnetwork.entity.repository.PersonRepository;
import cz.itnetwork.exception.BusinessException;
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

    @Mock private PersonMapper personMapper;
    @Mock private PersonRepository personRepository;

    @InjectMocks
    private PersonServiceImpl personService;

    // ── getAll ────────────────────────────────────────────────────────────────

    @Test
    void getAll_returnsOnlyVisiblePersons() {
        PersonEntity visible = new PersonEntity();
        visible.setHidden(false);
        when(personRepository.findAll(any(org.springframework.data.jpa.domain.Specification.class)))
                .thenReturn(List.of(visible));
        when(personMapper.toDTO(visible)).thenReturn(new PersonDTO());

        List<PersonDTO> result = personService.getAll(new PersonFilterDTO());
        assertEquals(1, result.size());
        verify(personRepository).findAll(any(org.springframework.data.jpa.domain.Specification.class));
    }

    // ── removePerson ──────────────────────────────────────────────────────────

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

    // ── getPersonById ─────────────────────────────────────────────────────────

    @Test
    void getPersonById_throwsWhenNotFound() {
        when(personRepository.findById(42L)).thenReturn(Optional.empty());
        assertThrows(EntityNotFoundException.class, () -> personService.getPersonById(42L));
    }

    // ── addPerson ─────────────────────────────────────────────────────────────

    @Test
    void addPerson_savesAndReturnsDTO() {
        PersonDTO dto    = new PersonDTO();
        PersonEntity entity = new PersonEntity();
        when(personMapper.toEntity(dto)).thenReturn(entity);
        when(personRepository.save(entity)).thenReturn(entity);
        when(personMapper.toDTO(entity)).thenReturn(dto);

        PersonDTO result = personService.addPerson(dto);

        assertNotNull(result);
        verify(personRepository).save(entity);
    }

    // ── addPersonsBulk ────────────────────────────────────────────────────────

    @Test
    void addPersonsBulk_throwsWhenListIsNull() {
        BusinessException ex = assertThrows(BusinessException.class,
                () -> personService.addPersonsBulk(null));
        assertTrue(ex.getMessage().contains("prázdný"));
    }

    @Test
    void addPersonsBulk_throwsWhenListIsEmpty() {
        BusinessException ex = assertThrows(BusinessException.class,
                () -> personService.addPersonsBulk(List.of()));
        assertTrue(ex.getMessage().contains("prázdný"));
    }

    @Test
    void addPersonsBulk_savesAllAndReturnsDTOs() {
        PersonDTO dto1 = new PersonDTO();
        PersonDTO dto2 = new PersonDTO();
        PersonEntity entity1 = new PersonEntity();
        PersonEntity entity2 = new PersonEntity();

        when(personMapper.toEntity(dto1)).thenReturn(entity1);
        when(personMapper.toEntity(dto2)).thenReturn(entity2);
        when(personRepository.saveAll(List.of(entity1, entity2)))
                .thenReturn(List.of(entity1, entity2));
        when(personMapper.toDTO(entity1)).thenReturn(dto1);
        when(personMapper.toDTO(entity2)).thenReturn(dto2);

        List<PersonDTO> result = personService.addPersonsBulk(List.of(dto1, dto2));

        assertEquals(2, result.size());
        verify(personRepository, times(1)).saveAll(any());
    }

    @Test
    void addPersonsBulk_callsSaveAllOnce_notPerItem() {
        // Ověří, že bulk nepoužívá save() v cyklu, ale saveAll() jednou
        PersonDTO dto1 = new PersonDTO();
        PersonDTO dto2 = new PersonDTO();
        PersonDTO dto3 = new PersonDTO();
        PersonEntity e1 = new PersonEntity();
        PersonEntity e2 = new PersonEntity();
        PersonEntity e3 = new PersonEntity();

        when(personMapper.toEntity(dto1)).thenReturn(e1);
        when(personMapper.toEntity(dto2)).thenReturn(e2);
        when(personMapper.toEntity(dto3)).thenReturn(e3);
        when(personRepository.saveAll(any())).thenReturn(List.of(e1, e2, e3));
        when(personMapper.toDTO(e1)).thenReturn(dto1);
        when(personMapper.toDTO(e2)).thenReturn(dto2);
        when(personMapper.toDTO(e3)).thenReturn(dto3);

        List<PersonDTO> result = personService.addPersonsBulk(List.of(dto1, dto2, dto3));

        assertEquals(3, result.size());
        verify(personRepository, times(1)).saveAll(any());
        verify(personRepository, never()).save(any());
    }

    @Test
    void addPersonsBulk_withSingleItem_works() {
        PersonDTO dto     = new PersonDTO();
        PersonEntity entity = new PersonEntity();

        when(personMapper.toEntity(dto)).thenReturn(entity);
        when(personRepository.saveAll(List.of(entity))).thenReturn(List.of(entity));
        when(personMapper.toDTO(entity)).thenReturn(dto);

        List<PersonDTO> result = personService.addPersonsBulk(List.of(dto));

        assertEquals(1, result.size());
    }
}
