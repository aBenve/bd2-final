package ar.edu.itba.bd2.pig.bluebank.dto;

import ar.edu.itba.bd2.pig.bluebank.validation.BlueBankCBU;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.hibernate.validator.constraints.UUID;
import org.hibernate.validator.constraints.UUID.LetterCase;
import org.springframework.format.annotation.NumberFormat;

public class TransactionRequest extends UserAuthenticationRequest{
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

}
