package ar.edu.itba.bd2.pig.bluebank.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.hibernate.validator.constraints.UUID;
import org.hibernate.validator.constraints.UUID.LetterCase;
import org.springframework.format.annotation.NumberFormat;

public class TransactionRequest {
    @NotNull
    @Size(min = 22, max = 22)
    private String originCBU;
    @NotNull
    @Size(min = 22, max = 22)
    private String destinationCBU;
    @UUID(letterCase = LetterCase.INSENSITIVE)
    private String originSecretToken;
    @UUID(letterCase = LetterCase.INSENSITIVE)
    private String destinationSecretToken;
    @NotNull
    @Size(min = 1, max = 18)
    @NumberFormat(pattern = "###.##")
    private String amount;

    public TransactionRequest() {
        super();
    }

    public String getAmount() {
        return amount;
    }

    public void setAmount(String amount) {
        this.amount = amount;
    }

    public String getOriginCBU() {
        return originCBU;
    }

    public void setOriginCBU(String originCbu) {
        this.originCBU = originCbu;
    }

    public String getDestinationCBU() {
        return destinationCBU;
    }

    public void setDestinationCBU(String destinationCbu) {
        this.destinationCBU = destinationCbu;
    }

    public String getOriginSecretToken() {
        return originSecretToken;
    }

    public void setOriginSecretToken(String originSecretToken) {
        this.originSecretToken = originSecretToken;
    }

    public String getDestinationSecretToken() {
        return destinationSecretToken;
    }

    public void setDestinationSecretToken(String destinationSecretToken) {
        this.destinationSecretToken = destinationSecretToken;
    }
}
