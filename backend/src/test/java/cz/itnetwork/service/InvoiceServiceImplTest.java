package cz.itnetwork.service;

import cz.itnetwork.dto.InvoiceDTO;
import cz.itnetwork.dto.PersonDTO;
import cz.itnetwork.dto.mapper.InvoiceMapper;
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

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
class InvoiceServiceImplTest {

    @Mock
    private InvoiceMapper invoiceMapper;
    @Mock
    private InvoiceRepository invoiceRepository;
    @Mock
    private PersonRepository personRepository;

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
}
