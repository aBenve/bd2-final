package ar.edu.itba.bd2.pig.bluebank.Dto;

import jakarta.annotation.Nullable;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.hibernate.validator.constraints.UUID;
import org.springframework.format.annotation.NumberFormat;

public class TransactionRequest {
    @NotNull
    @Size(min = 22, max = 22)
    private String originCbu;
    @NotNull
    @Size(min = 22, max = 22)
    private String destinationCbu;
    @UUID
    private String originSecretToken;
    @UUID
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

    public String getOriginCbu() {
        return originCbu;
    }

    public void setOriginCbu(String originCbu) {
        this.originCbu = originCbu;
    }

    public String getDestinationCbu() {
        return destinationCbu;
    }

    public void setDestinationCbu(String destinationCbu) {
        this.destinationCbu = destinationCbu;
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
