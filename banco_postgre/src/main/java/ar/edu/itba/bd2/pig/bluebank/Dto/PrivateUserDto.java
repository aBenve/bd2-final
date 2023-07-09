package ar.edu.itba.bd2.pig.bluebank.Dto;

import ar.edu.itba.bd2.pig.bluebank.model.User;

public class PrivateUserDto {
    private String phoneNumber;
    private String email;
    private String name;
    public static PrivateUserDto fromUser(User user){
        PrivateUserDto privateUserDto = new PrivateUserDto();

        privateUserDto.phoneNumber = user.getPhoneNumber();
        privateUserDto.email = user.getEmail();
        privateUserDto.name = user.getName();

        return privateUserDto;
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
