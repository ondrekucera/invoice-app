package cz.itnetwork.entity.repository;

import cz.itnetwork.entity.ExpenseEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ExpenseRepository extends JpaRepository<ExpenseEntity, Long> {

    List<ExpenseEntity> findByHidden(boolean hidden);
}
