package ar.edu.itba.bd2.pig.bluebank.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = CBUValidator.class)
public @interface CBU {
    String message() default "Invalid CBU";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}
