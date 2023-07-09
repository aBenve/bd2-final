package ar.edu.itba.bd2.pig.bluebank.controller;

import ar.edu.itba.bd2.pig.bluebank.model.User;
import ar.edu.itba.bd2.pig.bluebank.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/")
public class Controller {

    private UserRepository userRepository;

    @Autowired
    public Controller(UserRepository userRepository){
        this.userRepository = userRepository;
    }

    @GetMapping("/helloworld")
    public String sayHello(){
        return "Hello World!";
    }

    @GetMapping("/users")
    public List<User> getUsers(){
        return userRepository.findAll();
    }
}
