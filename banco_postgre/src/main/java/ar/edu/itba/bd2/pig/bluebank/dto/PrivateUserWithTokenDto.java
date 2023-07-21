package ar.edu.itba.bd2.pig.bluebank.dto;

import ar.edu.itba.bd2.pig.bluebank.model.User;

public class PrivateUserWithTokenDto {
    private String secretToken;
    private String phoneNumber;
    private String email;
    private String name;
    public static PrivateUserWithTokenDto fromUser(User user){
        PrivateUserWithTokenDto privateUserDto = new PrivateUserWithTokenDto();

        privateUserDto.secretToken = user.getToken().toString();
        privateUserDto.phoneNumber = user.getPhoneNumber();
        privateUserDto.email = user.getEmail();
        privateUserDto.name = user.getName();

        return privateUserDto;
    }

    public String getSecretToken() {
        return secretToken;
    }

    public void setSecretToken(String secretToken) {
        this.secretToken = secretToken;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}
