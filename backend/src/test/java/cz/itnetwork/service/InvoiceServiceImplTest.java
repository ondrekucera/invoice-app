package cz.itnetwork.service;

import cz.itnetwork.dto.InvoiceDTO;
import cz.itnetwork.dto.PersonDTO;
import cz.itnetwork.dto.mapper.InvoiceMapper;
import cz.itnetwork.entity.InvoiceEntity;
import cz.itnetwork.entity.PersonEntity;
import cz.itnetwork.entity.repository.InvoiceRepository;
import cz.itnetwork.entity.repository.PersonRepository;
import cz.itnetwork.exception.BusinessException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class InvoiceServiceImplTest {

    @Mock private InvoiceMapper invoiceMapper;
    @Mock private InvoiceRepository invoiceRepository;
    @Mock private PersonRepository personRepository;

    @InjectMocks
    private InvoiceServiceImpl invoiceService;

    private InvoiceDTO validInvoice;

    @BeforeEach
    void setUp() {
        PersonDTO buyer = new PersonDTO();
        buyer.setId(1L);

        PersonDTO seller = new PersonDTO();
        seller.setId(2L);

        validInvoice = new InvoiceDTO();
        validInvoice.setBuyer(buyer);
        validInvoice.setSeller(seller);
        validInvoice.setIssued(LocalDate.of(2026, 1, 1));
        validInvoice.setDueDate(LocalDate.of(2026, 2, 1));
        validInvoice.setPrice(1000L);
        validInvoice.setVat(21);
        validInvoice.setProduct("Test produkt");
    }

    // ── addInvoice – business validace ────────────────────────────────────────

    @Test
    void addInvoice_throwsWhenBuyerIsNull() {
        validInvoice.setBuyer(null);
        assertThrows(BusinessException.class, () -> invoiceService.addInvoice(validInvoice));
    }

    @Test
    void addInvoice_throwsWhenSellerIsNull() {
        validInvoice.setSeller(null);
        assertThrows(BusinessException.class, () -> invoiceService.addInvoice(validInvoice));
    }

    @Test
    void addInvoice_throwsWhenBuyerAndSellerAreSame() {
        PersonDTO same = new PersonDTO();
        same.setId(5L);
        validInvoice.setBuyer(same);
        validInvoice.setSeller(same);
        BusinessException ex = assertThrows(BusinessException.class,
                () -> invoiceService.addInvoice(validInvoice));
        assertTrue(ex.getMessage().contains("stejná osoba"));
    }

    @Test
    void addInvoice_throwsWhenDueDateBeforeIssued() {
        validInvoice.setIssued(LocalDate.of(2026, 3, 1));
        validInvoice.setDueDate(LocalDate.of(2026, 1, 1));
        BusinessException ex = assertThrows(BusinessException.class,
                () -> invoiceService.addInvoice(validInvoice));
        assertTrue(ex.getMessage().contains("splatnosti"));
    }

    @Test
    void addInvoice_throwsWhenPriceIsNegative() {
        validInvoice.setPrice(-1L);
        assertThrows(BusinessException.class, () -> invoiceService.addInvoice(validInvoice));
    }

    @Test
    void addInvoice_throwsWhenVatIsNegative() {
        validInvoice.setVat(-1);
        assertThrows(BusinessException.class, () -> invoiceService.addInvoice(validInvoice));
    }

    @Test
    void addInvoice_throwsWhenBuyerIdIsNull() {
        validInvoice.getBuyer().setId(null);
        assertThrows(BusinessException.class, () -> invoiceService.addInvoice(validInvoice));
    }

    // ── addInvoicesBulk ───────────────────────────────────────────────────────

    @Test
    void addInvoicesBulk_throwsWhenListIsNull() {
        BusinessException ex = assertThrows(BusinessException.class,
                () -> invoiceService.addInvoicesBulk(null));
        assertTrue(ex.getMessage().contains("prázdný"));
    }

    @Test
    void addInvoicesBulk_throwsWhenListIsEmpty() {
        BusinessException ex = assertThrows(BusinessException.class,
                () -> invoiceService.addInvoicesBulk(List.of()));
        assertTrue(ex.getMessage().contains("prázdný"));
    }

    @Test
    void addInvoicesBulk_throwsWhenAnyInvoiceHasSameBuyerAndSeller() {
        PersonDTO same = new PersonDTO();
        same.setId(5L);
        validInvoice.setBuyer(same);
        validInvoice.setSeller(same);

        BusinessException ex = assertThrows(BusinessException.class,
                () -> invoiceService.addInvoicesBulk(List.of(validInvoice)));
        assertTrue(ex.getMessage().contains("stejná osoba"));
    }

    @Test
    void addInvoicesBulk_savesAllAndReturnsDTO() {
        InvoiceEntity entity = new InvoiceEntity();
        PersonEntity buyerEntity  = new PersonEntity();
        PersonEntity sellerEntity = new PersonEntity();

        when(invoiceMapper.toEntity(validInvoice)).thenReturn(entity);
        when(personRepository.findById(1L)).thenReturn(Optional.of(buyerEntity));
        when(personRepository.findById(2L)).thenReturn(Optional.of(sellerEntity));
        when(invoiceRepository.saveAll(any())).thenReturn(List.of(entity));
        when(invoiceMapper.toDTO(entity)).thenReturn(validInvoice);

        List<InvoiceDTO> result = invoiceService.addInvoicesBulk(List.of(validInvoice));

        assertEquals(1, result.size());
        verify(invoiceRepository).saveAll(any());
        // saveAll musí být voláno přesně jednou – ne jednou za položku
        verify(invoiceRepository, times(1)).saveAll(any());
    }

    @Test
    void addInvoicesBulk_callsSaveAllOnce_notPerItem() {
        // Ověří, že bulk nepoužívá save() v cyklu, ale saveAll() jednou
        InvoiceEntity entity1 = new InvoiceEntity();
        InvoiceEntity entity2 = new InvoiceEntity();

        InvoiceDTO invoice2 = new InvoiceDTO();
        PersonDTO buyer2  = new PersonDTO(); buyer2.setId(3L);
        PersonDTO seller2 = new PersonDTO(); seller2.setId(4L);
        invoice2.setBuyer(buyer2);
        invoice2.setSeller(seller2);
        invoice2.setIssued(LocalDate.of(2026, 1, 1));
        invoice2.setDueDate(LocalDate.of(2026, 3, 1));
        invoice2.setPrice(500L);
        invoice2.setVat(0);
        invoice2.setProduct("Druhý produkt");

        PersonEntity buyerE1  = new PersonEntity();
        PersonEntity sellerE1 = new PersonEntity();
        PersonEntity buyerE2  = new PersonEntity();
        PersonEntity sellerE2 = new PersonEntity();

        when(invoiceMapper.toEntity(validInvoice)).thenReturn(entity1);
        when(invoiceMapper.toEntity(invoice2)).thenReturn(entity2);
        when(personRepository.findById(1L)).thenReturn(Optional.of(buyerE1));
        when(personRepository.findById(2L)).thenReturn(Optional.of(sellerE1));
        when(personRepository.findById(3L)).thenReturn(Optional.of(buyerE2));
        when(personRepository.findById(4L)).thenReturn(Optional.of(sellerE2));
        when(invoiceRepository.saveAll(any())).thenReturn(List.of(entity1, entity2));
        when(invoiceMapper.toDTO(entity1)).thenReturn(validInvoice);
        when(invoiceMapper.toDTO(entity2)).thenReturn(invoice2);

        List<InvoiceDTO> result = invoiceService.addInvoicesBulk(List.of(validInvoice, invoice2));

        assertEquals(2, result.size());
        verify(invoiceRepository, times(1)).saveAll(any());
        verify(invoiceRepository, never()).save(any());
    }
}
