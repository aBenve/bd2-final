package ar.edu.itba.bd2.pig.bluebank.exceptions;

public class IllegalOperationException extends RuntimeException{
    private static final String defaultMessage = "Illegal Operation.";

    public IllegalOperationException(){
        super(defaultMessage);
    }

    public IllegalOperationException(String message){
        super(message);
    }
}
