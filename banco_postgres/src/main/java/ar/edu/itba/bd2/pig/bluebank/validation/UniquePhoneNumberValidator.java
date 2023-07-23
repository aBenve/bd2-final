package ar.edu.itba.bd2.pig.bluebank.validation;

import ar.edu.itba.bd2.pig.bluebank.repository.UserRepository;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.regex.Pattern;

@Component
public class UniquePhoneNumberValidator implements ConstraintValidator<UniquePhoneNumber,String> {
    private static final String PHONE_NUMBER_PATTERN = "[0-9]{10}";
    private final UserRepository userRepository;

    @Autowired
    public UniquePhoneNumberValidator(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public void initialize(UniquePhoneNumber constraintAnnotation) {
        ConstraintValidator.super.initialize(constraintAnnotation);
    }

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        if(value == null){
            return false;
        }
        if(!Pattern.matches(PHONE_NUMBER_PATTERN, value)){
            context.disableDefaultConstraintViolation();
            context.buildConstraintViolationWithTemplate("Value is not a valid phone number")
                    .addConstraintViolation();
            return false;
        }
        return !userRepository.existsByPhoneNumber(value);
    }
}
