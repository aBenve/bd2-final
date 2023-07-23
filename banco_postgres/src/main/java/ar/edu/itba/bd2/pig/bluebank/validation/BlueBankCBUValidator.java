package ar.edu.itba.bd2.pig.bluebank.validation;

import ar.edu.itba.bd2.pig.bluebank.repository.UserRepository;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class BlueBankCBUValidator implements ConstraintValidator<BlueBankCBU,String> {
    private static final String BLUE_BANK_PREFIX = "000";
    private static final int CBU_LENGTH = 22;

    private final UserRepository userRepository;

    @Autowired
    public BlueBankCBUValidator(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public void initialize(BlueBankCBU constraintAnnotation) {
        ConstraintValidator.super.initialize(constraintAnnotation);
    }

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        return value != null && value.length() == CBU_LENGTH && value.startsWith(BLUE_BANK_PREFIX) && userRepository.findByCbu(value).isPresent();
    }
}
