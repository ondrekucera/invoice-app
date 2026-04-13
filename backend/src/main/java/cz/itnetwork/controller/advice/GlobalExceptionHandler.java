package cz.itnetwork.controller.advice;

import cz.itnetwork.dto.ErrorResponseDTO;
import cz.itnetwork.exception.BusinessException;
import jakarta.persistence.EntityNotFoundException;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Centrální handler výjimek pro celé REST API.
 * Převádí výjimky na konzistentní ErrorResponseDTO a správný HTTP status kód.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    /** Entita nebyla nalezena v databázi – 404 Not Found. */
    @ExceptionHandler(EntityNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public ErrorResponseDTO handleEntityNotFoundException(EntityNotFoundException ex, HttpServletRequest request) {
        return buildError(HttpStatus.NOT_FOUND, "Not Found", ex.getMessage(), request, null);
    }

    /**
     * Selhání Bean Validation (@Valid na DTO) – 400 Bad Request.
     * Odpověď obsahuje mapu polí na jejich chybové zprávy pro zobrazení ve formuláři.
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ErrorResponseDTO handleValidationException(MethodArgumentNotValidException ex, HttpServletRequest request) {
        Map<String, String> fieldErrors = ex.getBindingResult().getFieldErrors().stream()
                .collect(Collectors.toMap(
                        FieldError::getField,
                        fe -> fe.getDefaultMessage() != null ? fe.getDefaultMessage() : "Neplatná hodnota.",
                        (first, second) -> first // při více chybách na jednom poli ponecháme první
                ));
        return buildError(HttpStatus.BAD_REQUEST, "Bad Request", "Vstupní data obsahují chyby.", request, fieldErrors);
    }

    /**
     * Porušení business pravidel (např. buyer == seller) – 422 Unprocessable Entity.
     * Odlišuje se od 400, protože data jsou syntakticky správná, ale logicky nevalidní.
     */
    @ExceptionHandler(BusinessException.class)
    @ResponseStatus(HttpStatus.UNPROCESSABLE_ENTITY)
    public ErrorResponseDTO handleBusinessException(BusinessException ex, HttpServletRequest request) {
        return buildError(HttpStatus.UNPROCESSABLE_ENTITY, "Unprocessable Entity", ex.getMessage(), request, null);
    }

    /**
     * Porušení integritního omezení v DB (unique constraint, FK apod.) – 409 Conflict.
     * Rozpozná duplicitní IČO a vrátí srozumitelnou hlášku místo technického stacktrace.
     */
    @ExceptionHandler(DataIntegrityViolationException.class)
    @ResponseStatus(HttpStatus.CONFLICT)
    public ErrorResponseDTO handleDataIntegrityViolation(DataIntegrityViolationException ex, HttpServletRequest request) {
        String rootMessage = ex.getMostSpecificCause().getMessage();
        // Hledáme zmínku o unique constraintu na IČO – název sloupce nebo constraintu se může lišit dle DB
        String message = (rootMessage != null && rootMessage.toLowerCase().contains("identification_number"))
                ? "Osoba s tímto IČO již v evidenci existuje."
                : "Data porušují integritní pravidla databáze.";
        return buildError(HttpStatus.CONFLICT, "Conflict", message, request, null);
    }

    /**
     * Neplatný formát těla požadavku (nevalidní JSON, špatný datový typ) – 400 Bad Request.
     * Detaily z výjimky nevypisujeme do odpovědi, aby nedošlo k úniku interní struktury.
     */
    @ExceptionHandler(HttpMessageNotReadableException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ErrorResponseDTO handleHttpMessageNotReadable(HttpMessageNotReadableException ex, HttpServletRequest request) {
        return buildError(HttpStatus.BAD_REQUEST, "Bad Request",
                "Neplatný formát požadavku. Zkontrolujte, že všechna povinná pole jsou vyplněna správně.",
                request, null);
    }

    /**
     * Fallback pro všechny neočekávané výjimky – 500 Internal Server Error.
     * Logujeme celý stacktrace pro diagnostiku, uživateli vracíme obecnou hlášku.
     * Spring automaticky upřednostní specifičtější handlery výše – tento zachytí pouze to, co nic jiného nepokryje.
     */
    @ExceptionHandler(Exception.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public ErrorResponseDTO handleGenericException(Exception ex, HttpServletRequest request) {
        log.error("Neočekávaná chyba při zpracování požadavku {} {}", request.getMethod(), request.getRequestURI(), ex);
        return buildError(HttpStatus.INTERNAL_SERVER_ERROR, "Internal Server Error",
                "Došlo k neočekávané chybě. Zkuste to prosím znovu později.",
                request, null);
    }

    // ── Private helpers ──────────────────────────────────────────────────────

    private ErrorResponseDTO buildError(
            HttpStatus status,
            String error,
            String message,
            HttpServletRequest request,
            Map<String, String> validationErrors
    ) {
        return ErrorResponseDTO.builder()
                .timestamp(LocalDateTime.now())
                .status(status.value())
                .error(error)
                .message(message)
                .path(request.getRequestURI())
                .validationErrors(validationErrors)
                .build();
    }
}
