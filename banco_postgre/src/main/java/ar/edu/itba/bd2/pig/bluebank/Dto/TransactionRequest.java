package ar.edu.itba.bd2.pig.bluebank.Dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.springframework.format.annotation.NumberFormat;

public class TransactionRequest {
    @NotNull
    @Size(min = 22, max = 22)
    private String cbu;
    @NotNull
    @Size(min = 1, max = 18)
    @NumberFormat(pattern = "###.##")
    private String amount;

    public TransactionRequest() {
        super();
    }

    public String getCbu() {
        return cbu;
    }

    public void setCbu(String cbu) {
        this.cbu = cbu;
    }

    public String getAmount() {
        return amount;
    }

    public void setAmount(String amount) {
        this.amount = amount;
    }
}
