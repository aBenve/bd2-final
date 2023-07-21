package ar.edu.itba.bd2.pig.bluebank.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target(ElementType.FIELD)
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = UniqueEmailValidator.class)
public @interface UniqueEmail {
    String message() default "Invalid email. Value must be a valid email and unique in the bank";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}
