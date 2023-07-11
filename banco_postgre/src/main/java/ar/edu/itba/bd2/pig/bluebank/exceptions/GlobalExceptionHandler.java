package ar.edu.itba.bd2.pig.bluebank.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.WebRequest;

import java.time.LocalDateTime;
import java.util.Arrays;

@ControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(BadAuthenticationCredentialsException.class)
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

    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> globalExceptionHandler(Exception exception, WebRequest request){
        var exceptionDetails = new ExceptionDetails(exception.getMessage(), request.getDescription(false), LocalDateTime.now());
        return new ResponseEntity<>(exceptionDetails, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
