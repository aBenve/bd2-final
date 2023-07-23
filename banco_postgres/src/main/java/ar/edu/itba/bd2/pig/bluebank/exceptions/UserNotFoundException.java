package ar.edu.itba.bd2.pig.bluebank.exceptions;

public class UserNotFoundException extends ResourceNotFoundException{
    public UserNotFoundException(){
        super("The requested user could not be found.");
    }
}
