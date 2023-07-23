package ar.edu.itba.bd2.pig.bluebank.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class UserAccountRequest {
    @Size(min = 22, max = 22)
    @NotNull
    private String cbu;

    public String getCbu() {
        return cbu;
    }

    public void setCbu(String cbu) {
        this.cbu = cbu;
    }
}
