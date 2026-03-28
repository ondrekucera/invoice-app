package cz.itnetwork.exception;

// Výjimka pro porušení business pravidel – vrací HTTP 422
public class BusinessException extends RuntimeException {

    public BusinessException(String message) {
        super(message);
    }
}
