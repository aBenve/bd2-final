package ar.edu.itba.bd2.pig.bluebank.form;

import ar.edu.itba.bd2.pig.bluebank.validation.BlueBankCBU;
import ar.edu.itba.bd2.pig.bluebank.validation.UniqueEmail;
import ar.edu.itba.bd2.pig.bluebank.validation.UniquePhoneNumber;
import jakarta.validation.constraints.NotBlank;

public class UserForm {
    @BlueBankCBU
    private String cbu;
    @NotBlank
    private String name;
    @UniqueEmail
    private String email;
    @UniquePhoneNumber
    private String phoneNumber;
    @NotBlank
    private String password;

    public UserForm() {
    }

    public String getCbu() {
        return cbu;
    }

    public void setCbu(String cbu) {
        this.cbu = cbu;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
