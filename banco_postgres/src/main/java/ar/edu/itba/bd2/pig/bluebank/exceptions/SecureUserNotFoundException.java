package ar.edu.itba.bd2.pig.bluebank.exceptions;

public class SecureUserNotFoundException extends RuntimeException{
    private static final String defaultMessage = "There was an error with the authentication.";
    public SecureUserNotFoundException(){
        super(defaultMessage);
    }

    public SecureUserNotFoundException(String message){
        super(message);
    }
}
