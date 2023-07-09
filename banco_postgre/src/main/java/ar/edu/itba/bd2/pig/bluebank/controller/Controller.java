package ar.edu.itba.bd2.pig.bluebank.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/")
public class Controller {
    @GetMapping("/helloworld")
    public String sayHello(){
        return "Hello World!";
    }
}
