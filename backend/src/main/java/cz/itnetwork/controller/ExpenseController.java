package cz.itnetwork.controller;

import cz.itnetwork.dto.ExpenseDTO;
import cz.itnetwork.service.ExpenseService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/expenses")
@Tag(name = "Náklady", description = "Správa nákladů – vytváření, editace a soft delete.")
public class ExpenseController {

    private final ExpenseService expenseService;

    public ExpenseController(ExpenseService expenseService) {
        this.expenseService = expenseService;
    }

    @Operation(
            summary = "Seznam nákladů",
            description = "Vrátí všechny ne-skryté náklady v evidenci."
    )
    @GetMapping
    public List<ExpenseDTO> getExpenses() {
        return expenseService.getAll();
    }

    @Operation(
            summary = "Detail nákladu podle ID",
            description = "Vrátí náklad s daným ID. Pokud náklad neexistuje, vrátí 404."
    )
    @GetMapping("/{id}")
    public ExpenseDTO getExpenseById(@PathVariable Long id) {
        return expenseService.getExpenseById(id);
    }

    @Operation(
            summary = "Vytvoření nového nákladu",
            description = "Vytvoří nový náklad. Datum a částka jsou povinné, popis nesmí být prázdný."
    )
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ExpenseDTO addExpense(@Valid @RequestBody ExpenseDTO expenseDTO) {
        return expenseService.addExpense(expenseDTO);
    }

    @Operation(
            summary = "Aktualizace nákladu",
            description = "Aktualizuje existující náklad. Metadata jako ID a stav skrytí zůstávají zachována."
    )
    @PutMapping("/{id}")
    public ExpenseDTO updateExpense(@PathVariable Long id, @Valid @RequestBody ExpenseDTO expenseDTO) {
        return expenseService.updateExpense(id, expenseDTO);
    }

    @Operation(
            summary = "Smazání nákladu (soft delete)",
            description = "Označí náklad jako skrytý. Data zůstávají v DB pro zachování historie."
    )
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteExpense(@PathVariable Long id) {
        expenseService.removeExpense(id);
    }
}
