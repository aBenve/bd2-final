package ar.edu.itba.bd2.pig.bluebank.exceptions;

public class BadAuthorizationCredentialsException extends RuntimeException {
    private static final String defaultMessage = "Bad Authorization Credentials";

    public BadAuthorizationCredentialsException(){
        super(defaultMessage);
    }

    public BadAuthorizationCredentialsException(String message){
        super(message);
    }
}
