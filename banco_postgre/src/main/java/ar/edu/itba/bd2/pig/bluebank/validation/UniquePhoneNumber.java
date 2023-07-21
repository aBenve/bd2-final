package ar.edu.itba.bd2.pig.bluebank.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target(ElementType.FIELD)
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = UniquePhoneNumberValidator.class)
public @interface UniquePhoneNumber {
    String message() default "Invalid phone number. Value must be unique and 10 digits long with no dashes";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}
