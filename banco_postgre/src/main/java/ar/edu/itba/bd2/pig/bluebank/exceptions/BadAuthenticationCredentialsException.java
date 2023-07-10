package ar.edu.itba.bd2.pig.bluebank.exceptions;

public class BadAuthenticationCredentialsException extends RuntimeException{
    private static final String defaultMessage = "Bad Authentication Credentials.";

    public BadAuthenticationCredentialsException(){
        super(defaultMessage);
    }

    public BadAuthenticationCredentialsException(String message){
        super(message);
    }
}
