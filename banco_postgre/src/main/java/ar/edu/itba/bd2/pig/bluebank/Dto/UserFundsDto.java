package ar.edu.itba.bd2.pig.bluebank.Dto;

import ar.edu.itba.bd2.pig.bluebank.model.User;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.springframework.format.annotation.NumberFormat;

public class UserFundsDto {
    private String funds;
    private int accountId;

    public static UserFundsDto fromUser(User user){
        final UserFundsDto userFundsDto = new UserFundsDto();

        userFundsDto.accountId = user.getId();
        userFundsDto.funds = user.getBalance().toString();

        return userFundsDto;
    }

    public UserFundsDto() {
        super();
    }

    public String getFunds() {
        return funds;
    }

    public void setFunds(String funds) {
        this.funds = funds;
    }

    public int getAccountId() {
        return accountId;
    }

    public void setAccountId(int accountId) {
        this.accountId = accountId;
    }
}
