package ar.edu.itba.bd2.pig.bluebank.exceptions;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public class ExceptionDetails {
    private static final String dateTimeFormat = "dd/MM/yyyy HH:mm:ss";
    private static final DateTimeFormatter dateTimeFormatter = DateTimeFormatter.ofPattern(dateTimeFormat);
    private String cause;
    private String details;
    private String timestamp;

    public ExceptionDetails() {
    }

    public ExceptionDetails(String cause, String details, LocalDateTime timestamp){
        this.cause = cause;
        this.details = details;
        this.timestamp = dateTimeFormatter.format(timestamp);
    }

    public ExceptionDetails(String cause, String details){
        this(cause, details, LocalDateTime.now());
    }

    public String getCause() {
        return cause;
    }

    public void setCause(String cause) {
        this.cause = cause;
    }

    public String getDetails() {
        return details;
    }

    public void setDetails(String details) {
        this.details = details;
    }

    public String getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(String timestamp) {
        this.timestamp = timestamp;
    }
}
