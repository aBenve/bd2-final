package ar.edu.itba.bd2.pig.bluebank.controller;

import ar.edu.itba.bd2.pig.bluebank.Dto.*;
import ar.edu.itba.bd2.pig.bluebank.exceptions.BadAuthenticationCredentialsException;
import ar.edu.itba.bd2.pig.bluebank.exceptions.BadAuthorizationCredentialsException;
import ar.edu.itba.bd2.pig.bluebank.exceptions.IllegalOperationException;
import ar.edu.itba.bd2.pig.bluebank.exceptions.ResourceNotFoundException;
import ar.edu.itba.bd2.pig.bluebank.model.Transaction;
import ar.edu.itba.bd2.pig.bluebank.model.TransactionRole;
import ar.edu.itba.bd2.pig.bluebank.model.User;
import ar.edu.itba.bd2.pig.bluebank.repository.TransactionRepository;
import ar.edu.itba.bd2.pig.bluebank.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.math.MathContext;
import java.math.RoundingMode;
import java.util.*;
import java.util.function.BiConsumer;
import java.util.function.Consumer;
import java.util.function.Function;
import java.util.function.Supplier;

@RestController
@RequestMapping("/")
public class MainController {
    private static final MathContext financialMathContext = new MathContext(17, RoundingMode.DOWN);
    private static final Function<String, Supplier<ResourceNotFoundException>> userNotFoundExceptionSupplier =
            (cbu) -> () -> new ResourceNotFoundException(String.format("User %s not found.", cbu));
    private static final Function<String, Supplier<ResourceNotFoundException>> noActiveTransactionForUserSupplier =
            (cbu) -> () -> new ResourceNotFoundException(String.format("Cannot complete operation. User %s has no active transaction.", cbu));

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
        return UserDto.fromUser(
                userRepository.findByCbu(accountRequest.getCbu())
                .orElseThrow(userNotFoundExceptionSupplier.apply(accountRequest.getCbu()))
        );
    }

    @GetMapping("/isUser")
    public void isUser(@Valid UserAccountRequest accountRequest){
        userRepository.findByCbu(accountRequest.getCbu())
                .orElseThrow(() -> new ResourceNotFoundException(String.format("%s is not a user of Blue Bank", accountRequest.getCbu())));
    }

    /**
     * Verifies the given authentication credentials and returns the user's info, including
     * a secret token to use for authentication in later requests.
     * @param authorizationRequest
     */
    @PostMapping("/authorizeUser")
    public PrivateUserWithTokenDto authorizeUser(@Valid @RequestBody UserAuthorizationRequest authorizationRequest){
        User user = userRepository.findByCbu(authorizationRequest.getCbu())
                .orElseThrow(userNotFoundExceptionSupplier.apply(authorizationRequest.getCbu()));

        if(!passwordEncoder.matches(authorizationRequest.getPassword(), user.getPasswordHash()))
            throw new BadAuthorizationCredentialsException();

        return PrivateUserWithTokenDto.fromUser(user);
    }

    @PostMapping("/verifyUser")
    public void verifyUser(@Valid @RequestBody UserAuthenticationRequest authenticationRequest){
        authenticateUser(authenticationRequest);
    }

    /**
     * Returns the private info of a user given its secret token.
     * @param authenticationRequest
     * @return
     */
    @GetMapping("/userPrivate")
    public PrivateUserDto getPrivateUser(@Valid UserAuthenticationRequest authenticationRequest){
        User user = authenticateUser(authenticationRequest);
        return PrivateUserDto.fromUser(user);
    }

    @GetMapping("/checkFunds")
    public UserFundsDto checkFunds(@Valid UserAuthenticationRequest authenticationRequest){
        User user = authenticateUser(authenticationRequest);
        return UserFundsDto.fromUser(user);
    }

    @PostMapping("/addFunds")
    public UserFundsDto addFunds(@Valid @RequestBody FundsRequest fundsRequest){
        User user = userRepository.findByCbu(fundsRequest.getCbu())
                .orElseThrow(userNotFoundExceptionSupplier.apply(fundsRequest.getCbu()));
        Transaction transaction = Optional.ofNullable(user.getActiveTransaction())
                .orElseThrow(noActiveTransactionForUserSupplier.apply(fundsRequest.getCbu()));

        checkFundsRequest(fundsRequest, transaction);

        user.setBalance(user.getBalance().add(parseBigDecimal(fundsRequest.getAmount()) , financialMathContext));
        userRepository.updateBalanceByCbu(user.getBalance(), user.getCbu());
        transaction.complete();
        transactionRepository.save(transaction);

        return UserFundsDto.fromUser(user);
    }

    @PostMapping("/removeFunds")
    public UserFundsDto removeFunds(@Valid @RequestBody FundsRequest fundsRequest){
        User user = userRepository.findByCbu(fundsRequest.getCbu())
                .orElseThrow(userNotFoundExceptionSupplier.apply(fundsRequest.getCbu()));

        Transaction transaction = Optional.of(user.getActiveTransaction())
                .orElseThrow(noActiveTransactionForUserSupplier.apply(fundsRequest.getCbu()));

        checkFundsRequest(fundsRequest, transaction);

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

        // Check that at least one user belongs to the bank
        if(originUser.isEmpty() && destinationUser.isEmpty())
            throw new ResourceNotFoundException(String.format("Users %s and %s are not registered on Blue Bank. Please include a valid user from this bank.", transactionRequest.getOriginCbu(), transactionRequest.getDestinationCbu()));

        // Check that origin and destination user are not the same
        if(originUser.isPresent() && destinationUser.isPresent() && originUser.get().equals(destinationUser.get()))
            throw new IllegalOperationException("Cannot initiate a transaction from an account to itself.");

        // Check that none of the present users have active transactions
        if(originUser.isPresent() && originUser.get().getActiveTransaction() != null)
            throw new IllegalOperationException(String.format("There is already an active transaction for user %s, please try again later.", transactionRequest.getOriginCbu()));
        if(destinationUser.isPresent() && destinationUser.get().getActiveTransaction() != null)
            throw new IllegalOperationException(String.format("There is already an active transaction for user %s, please try again later.", transactionRequest.getDestinationCbu()));

        // Check that funds are enough
        if(originUser.isPresent() && originUser.get().getBalance().compareTo(parseBigDecimal(transactionRequest.getAmount())) < 0)
            throw new IllegalOperationException("Origin user does not have the required funds for this transaction.");

        // Check that there is no overflow when adding funds to destination
        if(destinationUser.isPresent()){
            var resultingFunds = BigDecimal.ZERO.add(destinationUser.get().getBalance()).add(parseBigDecimal(transactionRequest.getAmount())).stripTrailingZeros();
            if(resultingFunds.precision() - resultingFunds.scale() > 15){
                throw new IllegalOperationException("Destination user cannot receive that amount into their account.");
            }
        }

        final UUID transactionID = UUID.randomUUID();

        final BiConsumer<User, TransactionRole> lockAccountAndRegisterTransaction = (user, role) -> {
            user.lock();
            userRepository.save(user);

            final Transaction originTransaction = new Transaction();
            originTransaction.setUserId(user.getId());
            originTransaction.setAmount(parseBigDecimal(transactionRequest.getAmount()));
            originTransaction.setRole(role);
            originTransaction.setTransactionId(transactionID);
            transactionRepository.save(originTransaction);
        };

        originUser.ifPresent(user -> lockAccountAndRegisterTransaction.accept(user, TransactionRole.ORIGIN));
        destinationUser.ifPresent(user -> lockAccountAndRegisterTransaction.accept(user, TransactionRole.DESTINATION));

        return transactionID.toString();
    }

    @PostMapping("/endTransaction")
    public void endTransaction(@Valid @RequestBody @org.hibernate.validator.constraints.UUID String transactionId){
        Collection<Transaction> transactions = transactionRepository.findDistinctByTransactionId(UUID.fromString(transactionId));
        if(transactions.size() == 0)
            throw new ResourceNotFoundException(String.format("There is no active transaction with id %s", transactionId));

        Optional<Transaction> originTransaction = transactions.stream().filter(t -> t.getRole().equals(TransactionRole.ORIGIN)).findFirst();
        Optional<Transaction> destinationTransaction = transactions.stream().filter(t -> t.getRole().equals(TransactionRole.DESTINATION)).findFirst();

        final Consumer<Transaction> removeTransactionAndUnlockUser =  transaction -> {
            User user = transaction.getUser();

            transactionRepository.delete(transaction);
            user.setActiveTransaction(null);
            user.unlock();
            userRepository.save(user);
        };

        originTransaction.ifPresent(removeTransactionAndUnlockUser);
        destinationTransaction.ifPresent(removeTransactionAndUnlockUser);
    }

    private static BigDecimal parseBigDecimal(String number){
        return BigDecimal.valueOf(Double.parseDouble(number));
    }

    private User authenticateUser(UserAuthenticationRequest authenticationRequest){
        Optional<User> user = userRepository.findByCbu(authenticationRequest.getCbu());
        if(user.isEmpty())
            throw userNotFoundExceptionSupplier.apply(authenticationRequest.getCbu()).get();
        if(!user.get().getToken().toString().equals(authenticationRequest.getSecretToken()))
            throw new BadAuthenticationCredentialsException();
        return user.get();
    }

    private static void checkFundsRequest(FundsRequest fundsRequest, Transaction transaction){
        if(!transaction.getTransactionId().equals(UUID.fromString(fundsRequest.getTransactionId())))
            throw new BadAuthorizationCredentialsException(String.format("There is no transaction with id %s for user %s.", fundsRequest.getTransactionId(), fundsRequest.getCbu()));
        if(transaction.getAmount().compareTo(parseBigDecimal(fundsRequest.getAmount())) != 0)
            throw new BadAuthorizationCredentialsException("Wrong amount.");
        if(transaction.isCompleted())
            throw new IllegalOperationException("Illegal Operation: funds have already been moved.");
    }
}
