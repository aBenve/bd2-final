package ar.edu.itba.bd2.pig.bluebank.controller;

import ar.edu.itba.bd2.pig.bluebank.Dto.*;
import ar.edu.itba.bd2.pig.bluebank.model.Transaction;
import ar.edu.itba.bd2.pig.bluebank.model.TransactionRole;
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
import java.util.*;

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
    public UserDto getUser(@Valid UserAccountRequest accountRequest){
        return UserDto.fromUser(userRepository.findByCbu(accountRequest.getCbu()).orElseThrow()); // TODO: custom exception
    }

    @GetMapping("/isUser")
    public void isUser(@Valid UserAccountRequest accountRequest){
        userRepository.findByCbu(accountRequest.getCbu()).orElseThrow();
    }

    /**
     * Verifies the given authentication credentials and returns the user's info, including
     * a secret token to use for authentication in later requests.
     * @param authorizationRequest
     */
    @PostMapping("/authorizeUser")
    public PrivateUserWithTokenDto authorizeUser(@Valid @RequestBody UserAuthorizationRequest authorizationRequest){
        User user = userRepository.findByCbu(authorizationRequest.getCbu()).orElseThrow();

        if(!passwordEncoder.matches(authorizationRequest.getPassword(), user.getPasswordHash()))
            throw new RuntimeException();

        return PrivateUserWithTokenDto.fromUser(user);
    }

    @PostMapping("/verifyUser")
    public void verifyUser(@Valid @RequestBody UserAuthenticationRequest authenticationRequest){
        User user = authenticateUser(authenticationRequest).orElseThrow();
    }

    /**
     * Returns the private info of a user given its secret token.
     * @param authenticationRequest
     * @return
     */
    @GetMapping("/userPrivate")
    public PrivateUserDto getPrivateUser(@Valid UserAuthenticationRequest authenticationRequest){
        User user = authenticateUser(authenticationRequest).orElseThrow();
        return PrivateUserDto.fromUser(user);
    }

    @GetMapping("/checkFunds")
    public UserFundsDto checkFunds(@Valid UserAuthenticationRequest authenticationRequest){
        User user = authenticateUser(authenticationRequest).orElseThrow();
        return UserFundsDto.fromUser(user);
    }

    @PostMapping("/addFunds")
    public UserFundsDto addFunds(@Valid @RequestBody FundsRequest fundsRequest){
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
        Optional<User> originUser = userRepository.findByCbu(transactionRequest.getOriginCbu());
        Optional<User> destinationUser = userRepository.findByCbu(transactionRequest.getDestinationCbu());

        if(originUser.isEmpty() && destinationUser.isEmpty())
            throw new RuntimeException();

        if(originUser.isPresent() && destinationUser.isPresent() && originUser.get().equals(destinationUser.get()))
            throw new RuntimeException();

        if(
                (originUser.isPresent() && originUser.get().getActiveTransaction() != null) || (destinationUser.isPresent() && destinationUser.get().getActiveTransaction() != null)
        )
            throw new RuntimeException(); // There's already an active transaction

        final Transaction originTransaction = new Transaction();
        final Transaction destinationTransaction = new Transaction();
        final UUID transactionID = UUID.randomUUID();
        // Lock account
        originUser.ifPresent(user -> {
            user.lock();
            userRepository.save(user);
            originTransaction.setUserId(user.getId());
            originTransaction.setRole(TransactionRole.ORIGIN);
        });
        destinationUser.ifPresent(user -> {
            user.lock();
            userRepository.save(user);
            destinationTransaction.setUserId(user.getId());
            destinationTransaction.setRole(TransactionRole.DESTINATION);
        });
        // Create Transaction
        originTransaction.setAmount(parseBigDecimal(transactionRequest.getAmount()));
        destinationTransaction.setAmount(parseBigDecimal(transactionRequest.getAmount()));

        originTransaction.setTransactionId(transactionID);
        destinationTransaction.setTransactionId(transactionID);

        transactionRepository.saveAll(Arrays.asList(originTransaction, destinationTransaction));

        return transactionID.toString();
    }

    @PostMapping("/endTransaction")
    public void endTransaction(@Valid @RequestBody @org.hibernate.validator.constraints.UUID String transactionId){
        Collection<Transaction> transactions = transactionRepository.findDistinctByTransactionId(UUID.fromString(transactionId));
        Transaction originTransaction = transactions.stream().filter(t -> t.getRole().equals(TransactionRole.ORIGIN)).findFirst().orElseThrow();
        Transaction destinationTransaction = transactions.stream().filter(t -> t.getRole().equals(TransactionRole.DESTINATION)).findFirst().orElseThrow();

        Optional<User> originUser = Optional.of(originTransaction.getUser());
        Optional<User> destinationUser = Optional.of(destinationTransaction.getUser());

        // Remove transaction and unlock users
        transactionRepository.delete(originTransaction);
        transactionRepository.delete(destinationTransaction);
        originUser.ifPresent(user -> {
            user.setActiveTransaction(null);
            user.unlock();
            User unlockedUser = userRepository.save(user);
        });
        destinationUser.ifPresent(user -> {
            user.setActiveTransaction(null);
            user.unlock();
            User unlockedUser = userRepository.save(user);
        });
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
