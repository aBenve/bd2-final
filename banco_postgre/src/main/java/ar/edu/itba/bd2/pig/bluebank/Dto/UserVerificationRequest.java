package ar.edu.itba.bd2.pig.bluebank.Dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class UserVerificationRequest {
    @Size(min = 22, max = 22)
    @NotNull
    private String cbu;

    @NotNull
    private String passwordHash;

    public String getCbu() {
        return cbu;
    }

    public void setCbu(String cbu) {
        this.cbu = cbu;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }
}
