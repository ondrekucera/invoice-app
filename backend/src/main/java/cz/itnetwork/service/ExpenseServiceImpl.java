package cz.itnetwork.service;

import cz.itnetwork.dto.ExpenseDTO;
import cz.itnetwork.dto.mapper.ExpenseMapper;
import cz.itnetwork.entity.ExpenseEntity;
import cz.itnetwork.entity.repository.ExpenseRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class ExpenseServiceImpl implements ExpenseService {

    private final ExpenseMapper expenseMapper;
    private final ExpenseRepository expenseRepository;

    public ExpenseServiceImpl(ExpenseMapper expenseMapper, ExpenseRepository expenseRepository) {
        this.expenseMapper     = expenseMapper;
        this.expenseRepository = expenseRepository;
    }

    @Override
    public ExpenseDTO addExpense(ExpenseDTO expenseDTO) {
        ExpenseEntity entity = expenseMapper.toEntity(expenseDTO);
        return expenseMapper.toDTO(expenseRepository.save(entity));
    }

    @Override
    @Transactional(readOnly = true)
    public List<ExpenseDTO> getAll() {
        return expenseRepository.findByHidden(false)
                .stream()
                .map(expenseMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ExpenseDTO getExpenseById(long id) {
        return expenseMapper.toDTO(fetchExpenseById(id));
    }

    @Override
    public ExpenseDTO updateExpense(long id, ExpenseDTO expenseDTO) {
        ExpenseEntity existing = fetchExpenseById(id);

        ExpenseEntity updated = expenseMapper.toEntity(expenseDTO);
        updated.setId(id);
        updated.setHidden(existing.isHidden());

        return expenseMapper.toDTO(expenseRepository.save(updated));
    }

    @Override
    public void removeExpense(long id) {
        try {
            ExpenseEntity expense = fetchExpenseById(id);
            expense.setHidden(true);
            expenseRepository.save(expense);
        } catch (EntityNotFoundException ignored) {
        }
    }

    private ExpenseEntity fetchExpenseById(long id) {
        return expenseRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Náklad s id " + id + " nebyl nalezen."
                ));
    }
}
