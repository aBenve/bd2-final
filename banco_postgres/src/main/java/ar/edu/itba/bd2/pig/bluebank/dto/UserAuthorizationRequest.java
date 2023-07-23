package ar.edu.itba.bd2.pig.bluebank.dto;

import ar.edu.itba.bd2.pig.bluebank.validation.CBU;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class UserAuthorizationRequest {
    @CBU
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
