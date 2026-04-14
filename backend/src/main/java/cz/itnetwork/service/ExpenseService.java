package cz.itnetwork.service;

import cz.itnetwork.dto.ExpenseDTO;

import java.util.List;

public interface ExpenseService {

    ExpenseDTO addExpense(ExpenseDTO expenseDTO);

    List<ExpenseDTO> getAll();

    ExpenseDTO getExpenseById(long id);

    ExpenseDTO updateExpense(long id, ExpenseDTO expenseDTO);

    void removeExpense(long id);
}
