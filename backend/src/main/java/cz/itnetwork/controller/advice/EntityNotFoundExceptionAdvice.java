package cz.itnetwork.controller.advice;

import cz.itnetwork.dto.ErrorResponseDTO;
import cz.itnetwork.exception.BusinessException;
import jakarta.persistence.EntityNotFoundException;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.stream.Collectors;

@RestControllerAdvice
public class EntityNotFoundExceptionAdvice {

    // Entita nebyla nalezena – 404
    @ExceptionHandler(EntityNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public ErrorResponseDTO handleEntityNotFoundException(EntityNotFoundException ex, HttpServletRequest request) {
        return ErrorResponseDTO.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.NOT_FOUND.value())
                .error("Not Found")
                .message(ex.getMessage())
                .path(request.getRequestURI())
                .build();
    }

    // Porušení Bean Validation – 400, obsahuje mapu fieldů s chybami
    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ErrorResponseDTO handleValidationException(MethodArgumentNotValidException ex, HttpServletRequest request) {
        var errors = ex.getBindingResult().getFieldErrors().stream()
                .collect(Collectors.toMap(
                        FieldError::getField,
                        fe -> fe.getDefaultMessage() != null ? fe.getDefaultMessage() : "Neplatná hodnota.",
                        (a, b) -> a
                ));
        return ErrorResponseDTO.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.BAD_REQUEST.value())
                .error("Bad Request")
                .message("Vstupní data obsahují chyby.")
                .path(request.getRequestURI())
                .validationErrors(errors)
                .build();
    }

    // Porušení business pravidel – 422
    @ExceptionHandler(BusinessException.class)
    @ResponseStatus(HttpStatus.UNPROCESSABLE_ENTITY)
    public ErrorResponseDTO handleBusinessException(BusinessException ex, HttpServletRequest request) {
        return ErrorResponseDTO.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.UNPROCESSABLE_ENTITY.value())
                .error("Unprocessable Entity")
                .message(ex.getMessage())
                .path(request.getRequestURI())
                .build();
    }
}
