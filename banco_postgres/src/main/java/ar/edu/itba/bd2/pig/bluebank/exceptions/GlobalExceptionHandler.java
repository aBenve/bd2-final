package ar.edu.itba.bd2.pig.bluebank.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.WebRequest;

import java.time.LocalDateTime;

@ControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler({BadAuthenticationCredentialsException.class, SecureUserNotFoundException.class})
    public ResponseEntity<?> badAuthenticationHandler(Exception exception, WebRequest request){
        var exceptionDetails = new ExceptionDetails(exception.getMessage(), request.getDescription(false), LocalDateTime.now());
        return new ResponseEntity<>(exceptionDetails, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(BadAuthorizationCredentialsException.class)
    public ResponseEntity<?> badAuthorizationHandler(Exception exception, WebRequest request){
        var exceptionDetails = new ExceptionDetails(exception.getMessage(), request.getDescription(false), LocalDateTime.now());
        return new ResponseEntity<>(exceptionDetails, HttpStatus.UNAUTHORIZED);
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<?> resourceNotFoundHandler(ResourceNotFoundException exception, WebRequest request){
        var exceptionDetails = new ExceptionDetails(exception.getMessage(), request.getDescription(false), LocalDateTime.now());
        return new ResponseEntity<>(exceptionDetails, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(IllegalOperationException.class)
    public ResponseEntity<?> illegalOperationHandler(IllegalOperationException exception, WebRequest request){
        var exceptionDetails = new ExceptionDetails(exception.getMessage(), request.getDescription(false), LocalDateTime.now());
        return new ResponseEntity<>(exceptionDetails, HttpStatus.FORBIDDEN);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<?> invalidRequestBodyHandler(MethodArgumentNotValidException exception, WebRequest request){
        StringBuilder errorMsg = new StringBuilder("Invalid values in body:").append('\n');
        for(FieldError error : exception.getFieldErrors()){
            errorMsg.append("for field ").append(error.getField())
                    .append(" = '").append(error.getRejectedValue())
                    .append("': ")
                    .append(error.getDefaultMessage()).append('\n');
        }
        var exceptionDetails = new ExceptionDetails(errorMsg.toString(), request.getDescription(false), LocalDateTime.now());
        return new ResponseEntity<>(exceptionDetails, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> globalExceptionHandler(Exception exception, WebRequest request){
        var exceptionDetails = new ExceptionDetails(exception.getMessage(), request.getDescription(false), LocalDateTime.now());
        return new ResponseEntity<>(exceptionDetails, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
