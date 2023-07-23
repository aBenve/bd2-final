package ar.edu.itba.bd2.pig.bluebank.validation;

import ar.edu.itba.bd2.pig.bluebank.repository.UserRepository;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

public class GenericCBUValidator implements ConstraintValidator<GenericCBU,String> {
    private static final int CBU_LENGTH = 22;

    @Override
    public void initialize(GenericCBU constraintAnnotation) {
        ConstraintValidator.super.initialize(constraintAnnotation);
    }

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        return value != null && value.length() == CBU_LENGTH;
    }
}
