package ar.edu.itba.bd2.pig.bluebank.Dto;

import ar.edu.itba.bd2.pig.bluebank.model.User;

public class UserDto {
    private String name;
    private String cbu;

    public static UserDto fromUser(User user){
        final UserDto userDto = new UserDto();

        userDto.name = user.getName();
        userDto.cbu = user.getCbu();

        return userDto;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getCbu() {
        return cbu;
    }

    public void setCbu(String cbu) {
        this.cbu = cbu;
    }
}
