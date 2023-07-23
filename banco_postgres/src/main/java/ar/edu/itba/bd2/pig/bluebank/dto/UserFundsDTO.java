package ar.edu.itba.bd2.pig.bluebank.dto;

import ar.edu.itba.bd2.pig.bluebank.model.User;

public class UserFundsDTO {
    private String funds;
    private int accountId;

    public static UserFundsDTO fromUser(User user){
        final UserFundsDTO userFundsDto = new UserFundsDTO();

        userFundsDto.accountId = user.getId();
        userFundsDto.funds = user.getBalance().toString();

        return userFundsDto;
    }

    public UserFundsDTO() {
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
