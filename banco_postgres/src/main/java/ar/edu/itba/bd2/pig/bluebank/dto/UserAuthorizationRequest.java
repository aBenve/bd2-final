package ar.edu.itba.bd2.pig.bluebank.dto;

import ar.edu.itba.bd2.pig.bluebank.validation.BlueBankCBU;
import jakarta.validation.constraints.NotNull;

public class UserAuthorizationRequest {
    @BlueBankCBU
    private String cbu;
    @NotNull
    private String password;

    public String getCbu() {
        return cbu;
    }

    public void setCbu(String cbu) {
        this.cbu = cbu;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
