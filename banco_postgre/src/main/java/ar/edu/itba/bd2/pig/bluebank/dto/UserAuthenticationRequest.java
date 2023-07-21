package ar.edu.itba.bd2.pig.bluebank.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.hibernate.validator.constraints.UUID;

public class UserAuthenticationRequest {    @Size(min = 22, max = 22)
    @NotNull
    private String cbu;
    @NotNull
    @UUID
    private String secretToken;

    public String getCbu() {
        return cbu;
    }

    public void setCbu(String cbu) {
        this.cbu = cbu;
    }

    public String getSecretToken() {
        return secretToken;
    }

    public void setSecretToken(String secretToken) {
        this.secretToken = secretToken;
    }

}
