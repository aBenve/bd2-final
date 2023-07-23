package ar.edu.itba.bd2.pig.bluebank.exceptions;

public class ResourceNotFoundException extends RuntimeException{
    private static final String defaultMessage = "The requested resource could not be found.";
    public ResourceNotFoundException(){
        super(defaultMessage);
    }

    public ResourceNotFoundException(String message){
        super(message);
    }
}
