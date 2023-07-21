package ar.edu.itba.bd2.pig.bluebank.dto;

import ar.edu.itba.bd2.pig.bluebank.model.User;

public class UserDTO {
    private String name;
    private String cbu;

    public static UserDTO fromUser(User user){
        final UserDTO userDto = new UserDTO();

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
