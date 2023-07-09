package ar.edu.itba.bd2.pig.bluebank.controller;

import ar.edu.itba.bd2.pig.bluebank.Dto.*;
import ar.edu.itba.bd2.pig.bluebank.model.Transaction;
import ar.edu.itba.bd2.pig.bluebank.model.User;
import ar.edu.itba.bd2.pig.bluebank.repository.TransactionRepository;
import ar.edu.itba.bd2.pig.bluebank.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.math.MathContext;
import java.math.RoundingMode;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/")
public class MainController {
    private static final MathContext financialMathContext = new MathContext(17, RoundingMode.DOWN);
    private final UserRepository userRepository;
    private final TransactionRepository transactionRepository;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public MainController(UserRepository userRepository, TransactionRepository transactionRepository, PasswordEncoder passwordEncoder){
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.transactionRepository = transactionRepository;
    }

    // TODO: remove
    @GetMapping("/users")
    public List<UserDto> getUsers(){
        return userRepository.findAll().stream().map(UserDto::fromUser).toList();
    }

    @GetMapping("/getUser")
    public UserDto getUser(@Valid @RequestBody UserAccountRequest accountRequest){
        return UserDto.fromUser(userRepository.findByCbu(accountRequest.getCbu()).orElseThrow()); // TODO: custom exception
    }

    @GetMapping("/isUser")
    public void isUser(@Valid @RequestBody UserAccountRequest accountRequest){
        userRepository.findByCbu(accountRequest.getCbu()).orElseThrow();
    }

    /**
     * Verifies the given authentication credentials and returns the user's info, including
     * a secret token to use for authentication in later requests.
     * @param verificationRequest
     */
    @PostMapping("/verifyUser")
    public PrivateUserWithTokenDto verifyUser(@Valid @RequestBody UserVerificationRequest verificationRequest){
        User user = userRepository.findByCbu(verificationRequest.getCbu()).orElseThrow();
        if(!user.getPasswordHash().equals(verificationRequest.getPasswordHash()))
            throw new RuntimeException();

        return PrivateUserWithTokenDto.fromUser(user);
    }

    /**
     * Returns the private info of a user given its secret token.
     * @param authenticationRequest
     * @return
     */
    @GetMapping("/userPrivate")
    public PrivateUserDto getPrivateUser(@Valid @RequestBody UserAuthenticationRequest authenticationRequest){
        User user = authenticateUser(authenticationRequest).orElseThrow();
        return PrivateUserDto.fromUser(user);
    }

    @GetMapping("/checkFunds")
    public UserFundsDto checkFunds(@Valid @RequestBody UserAuthenticationRequest authenticationRequest){
        User user = authenticateUser(authenticationRequest).orElseThrow();
        return UserFundsDto.fromUser(user);
    }

    @PostMapping("/addFunds")
    public UserFundsDto addFunds(@Valid @RequestBody FundsRequest fundsRequest){
        User user = userRepository.findByCbu(fundsRequest.getCbu()).orElseThrow();
        // TODO: check for transaction
        Transaction transaction = Optional.of(user.getActiveTransaction()).orElseThrow();
        if(
                !transaction.getTransactionId().equals(UUID.fromString(fundsRequest.getTransactionId()))
        )
            throw new RuntimeException();
        if(
                transaction.getAmount().compareTo(parseBigDecimal(fundsRequest.getAmount())) != 0
        )
            throw new RuntimeException();
        if(transaction.isCompleted())
            throw new RuntimeException();

        user.setBalance(user.getBalance().add(parseBigDecimal(fundsRequest.getAmount()) , financialMathContext));
        userRepository.updateBalanceByCbu(user.getBalance(), user.getCbu());
        transaction.complete();
        transactionRepository.save(transaction);

        return UserFundsDto.fromUser(user);
    }

    @PostMapping("/removeFunds")
    public UserFundsDto removeFunds(@Valid @RequestBody FundsRequest fundsRequest){
        User user = userRepository.findByCbu(fundsRequest.getCbu()).orElseThrow();

        Transaction transaction = Optional.of(user.getActiveTransaction()).orElseThrow();
        if(
                !transaction.getTransactionId().equals(UUID.fromString(fundsRequest.getTransactionId()))
        )
            throw new RuntimeException();
        if(
                transaction.getAmount().compareTo(parseBigDecimal(fundsRequest.getAmount())) != 0
        )
            throw new RuntimeException();
        if(transaction.isCompleted())
            throw new RuntimeException();

        user.setBalance(user.getBalance().subtract(parseBigDecimal(fundsRequest.getAmount()) , financialMathContext));
        userRepository.updateBalanceByCbu(user.getBalance(), user.getCbu());
        transaction.complete();
        transactionRepository.save(transaction);

        return UserFundsDto.fromUser(user);
    }

    @PostMapping("/initiateTransaction")
    public String initiateTransaction(@Valid @RequestBody TransactionRequest transactionRequest){
        User user = userRepository.findByCbu(transactionRequest.getCbu()).orElseThrow();

        if(user.getActiveTransaction() != null)
            throw new RuntimeException();
        // Lock account
        user.lock();
        User lockedUser = userRepository.save(user);
        // Create Transaction
        final Transaction newTransaction = new Transaction();
        newTransaction.setAmount(parseBigDecimal(transactionRequest.getAmount()));
        newTransaction.setUserId(lockedUser.getId());
        Transaction createdTransaction = transactionRepository.save(newTransaction);

        return createdTransaction.getTransactionId().toString();
    }

    @PostMapping("/endTransaction")
    public void endTransaction(@Valid @RequestBody @org.hibernate.validator.constraints.UUID String transactionId){
        Transaction transaction = transactionRepository.findById(UUID.fromString(transactionId)).orElseThrow();
        User user = transaction.getUser();

        // Remove transaction
        transactionRepository.delete(transaction);
        user.setActiveTransaction(null);
        // Unlock account
        user.unlock();
        User unlockedUser = userRepository.save(user);
    }

    private static BigDecimal parseBigDecimal(String number){
        return BigDecimal.valueOf(Double.parseDouble(number));
    }

    private Optional<User> authenticateUser(UserAuthenticationRequest authenticationRequest){
        Optional<User> user = userRepository.findByCbu(authenticationRequest.getCbu());
        if(user.isEmpty()|| !user.get().getToken().toString().equals(authenticationRequest.getSecretToken()))
            return Optional.empty();
        return user;
    }
}
