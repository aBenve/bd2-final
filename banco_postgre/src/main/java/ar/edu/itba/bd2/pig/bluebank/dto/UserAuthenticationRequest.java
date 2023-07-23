package ar.edu.itba.bd2.pig.bluebank.dto;

import ar.edu.itba.bd2.pig.bluebank.validation.CBU;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.hibernate.validator.constraints.UUID;
import org.hibernate.validator.constraints.UUID.LetterCase;

public class UserAuthenticationRequest {    @Size(min = 22, max = 22)
    @CBU
    private String cbu;
    @NotNull
    @UUID(letterCase = LetterCase.INSENSITIVE)
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
