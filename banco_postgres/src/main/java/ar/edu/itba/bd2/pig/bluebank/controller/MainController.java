package ar.edu.itba.bd2.pig.bluebank.controller;

import ar.edu.itba.bd2.pig.bluebank.dto.*;
import ar.edu.itba.bd2.pig.bluebank.exceptions.*;
import ar.edu.itba.bd2.pig.bluebank.form.UserForm;
import ar.edu.itba.bd2.pig.bluebank.model.Transaction;
import ar.edu.itba.bd2.pig.bluebank.model.TransactionRecord;
import ar.edu.itba.bd2.pig.bluebank.model.TransactionRole;
import ar.edu.itba.bd2.pig.bluebank.model.User;
import ar.edu.itba.bd2.pig.bluebank.repository.TransactionHistoryRepository;
import ar.edu.itba.bd2.pig.bluebank.repository.TransactionRepository;
import ar.edu.itba.bd2.pig.bluebank.repository.UserRepository;
import ar.edu.itba.bd2.pig.bluebank.validation.BlueBankCBU;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;

import org.hibernate.validator.constraints.UUID.LetterCase;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.math.BigDecimal;
import java.math.MathContext;
import java.math.RoundingMode;
import java.time.LocalDateTime;
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
    private final TransactionHistoryRepository transactionHistoryRepository;


    @Autowired
    public MainController(UserRepository userRepository, TransactionRepository transactionRepository, PasswordEncoder passwordEncoder, TransactionHistoryRepository transactionHistoryRepository){
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.transactionRepository = transactionRepository;
        this.transactionHistoryRepository = transactionHistoryRepository;
    }

    @GetMapping("/users")
    public List<UserDTO> getUsers(){
        return userRepository.findAll().stream().map(UserDTO::fromUser).toList();
    }

    @PostMapping("/users")
    @Transactional
    public void createUser(@Valid @RequestBody UserForm userForm, HttpServletResponse httpServletResponse){
        User newUser = new User(userForm.getCbu(), userForm.getName(), userForm.getEmail(), userForm.getPhoneNumber(), passwordEncoder.encode(userForm.getPassword()));
        User createdUser = userRepository.save(newUser);
        String resourceLocation = ServletUriComponentsBuilder.fromCurrentContextPath().pathSegment("users", String.valueOf(createdUser.getId())).toUriString();
        httpServletResponse.setStatus(HttpServletResponse.SC_CREATED);
        httpServletResponse.addHeader(HttpHeaders.LOCATION, resourceLocation);
    }

    @GetMapping("/users/{id}")
    public User getUser(@PathVariable("id") int id){
        return userRepository.findById(id).orElseThrow(UserNotFoundException::new);
    }

    @DeleteMapping("/users/{id}")
    @Transactional
    public String deleteUser(@PathVariable("id") int id, HttpServletResponse httpServletResponse){
        List<User> removed = userRepository.removeById(id);
        if(removed.isEmpty()){
            httpServletResponse.setStatus(HttpServletResponse.SC_NOT_FOUND);
            return "User not found";
        }
        httpServletResponse.setStatus(HttpServletResponse.SC_OK);
        return "Goodbye " + removed.get(0) + "!!!!";
    }

    @GetMapping("/users/{id}/transaction")
    public TransactionDTO getUserTransaction(@PathVariable(name = "id") int userId){
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found."));
        Transaction transaction = Optional.ofNullable(user.getActiveTransaction())
                .orElseThrow(() -> new ResourceNotFoundException(String.format("User %s has no active transaction.", user.getCbu())));

        return TransactionDTO.fromTransaction(transaction);
    }

    @GetMapping("/getUser")
    public UserDTO getUser(@Valid @BlueBankCBU String cbu){
        return UserDTO.fromUser(
                userRepository.findByCbu(cbu)
                .orElseThrow(userNotFoundExceptionSupplier.apply(cbu))
        );
    }

    /**
     * Verifies the given authentication credentials and returns the user's info, including
     * a secret token to use for authentication in later requests.
     * @param authorizationRequest
     */
    @PostMapping("/authorizeUser")
    @Transactional
    public PrivateUserWithTokenDto authorizeUser(@Valid @RequestBody UserAuthorizationRequest authorizationRequest){
        User user = userRepository.findByCbu(authorizationRequest.getCbu())
                .orElseThrow(SecureUserNotFoundException::new);

        if(!passwordEncoder.matches(authorizationRequest.getPassword(), user.getPasswordHash()))
            throw new BadAuthorizationCredentialsException();

        return PrivateUserWithTokenDto.fromUser(user);
    }

    /**
     * Verifies that the given authentication credentials are valid.
     * 
     * @param authenticationRequest CBU and token
     */
    @PostMapping("/verifyUser")
    @Transactional
    public void verifyUser(@Valid @RequestBody UserAuthenticationRequest authenticationRequest){
        authenticateUser(authenticationRequest);
    }

    /**
     * Returns the private info of a user given its secret token.
     * @param authenticationRequest
     * @return
     */
    @GetMapping("/userPrivate")
    public PrivateUserDTO getPrivateUser(@Valid UserAuthenticationRequest authenticationRequest){
        User user = authenticateUser(authenticationRequest);
        return PrivateUserDTO.fromUser(user);
    }

    @GetMapping("/checkFunds")
    public String checkFunds(@Valid UserAuthenticationRequest authenticationRequest){
        User user = authenticateUser(authenticationRequest);
        return user.getBalance().toString();
    }

    @PatchMapping("/addFunds")
    @Transactional
    public UserFundsDTO addFunds(@Valid @RequestBody FundsRequest fundsRequest){
        User user = authenticateUser(fundsRequest);
        Transaction transaction = Optional.ofNullable(user.getActiveTransaction())
                .orElseThrow(noActiveTransactionForUserSupplier.apply(fundsRequest.getCbu()));

        checkFundsRequest(fundsRequest, transaction);

        user.setBalance(user.getBalance().add(parseBigDecimal(fundsRequest.getAmount()) , financialMathContext));
        userRepository.updateBalanceByCbu(user.getBalance(), user.getCbu());
        transaction.complete();
        transactionRepository.save(transaction);

        return UserFundsDTO.fromUser(user);
    }

    @PatchMapping("/removeFunds")
    @Transactional
    public UserFundsDTO removeFunds(@Valid @RequestBody FundsRequest fundsRequest){
        User user = authenticateUser(fundsRequest);
        Transaction transaction = Optional.of(user.getActiveTransaction())
                .orElseThrow(noActiveTransactionForUserSupplier.apply(fundsRequest.getCbu()));

        checkFundsRequest(fundsRequest, transaction);

        user.setBalance(user.getBalance().subtract(parseBigDecimal(fundsRequest.getAmount()) , financialMathContext));
        userRepository.updateBalanceByCbu(user.getBalance(), user.getCbu());
        transaction.complete();
        transactionRepository.save(transaction);

        return UserFundsDTO.fromUser(user);
    }

    @PostMapping("/initiateTransaction")
    @Transactional
    public String initiateTransaction(@Valid @RequestBody TransactionRequest transactionRequest){
        Optional<User> originUser = userRepository.findByCbu(transactionRequest.getOriginCBU());
        Optional<User> destinationUser = userRepository.findByCbu(transactionRequest.getDestinationCBU());

        // Check that at least one user belongs to the bank
        if(originUser.isEmpty() && destinationUser.isEmpty())
            throw new ResourceNotFoundException(String.format(
                    "Users %s and %s are not registered on Blue Bank. Please include a valid user from this bank.",
                    transactionRequest.getOriginCBU(), transactionRequest.getDestinationCBU()));

        // Check that origin and destination user are not the same
        if(originUser.isPresent() && destinationUser.isPresent() && originUser.get().equals(destinationUser.get()))
            throw new IllegalOperationException("Cannot initiate a transaction from an account to itself.");

        // Check that none of the present users have active transactions
        if(originUser.isPresent() && originUser.get().getActiveTransaction() != null)
            throw new IllegalOperationException(
                    String.format("There is already an active transaction for user %s, please try again later.",
                            transactionRequest.getOriginCBU()));
        if(destinationUser.isPresent() && destinationUser.get().getActiveTransaction() != null)
            throw new IllegalOperationException(
                    String.format("There is already an active transaction for user %s, please try again later.",
                            transactionRequest.getDestinationCBU()));

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
        final BigDecimal transactionAmount = parseBigDecimal(transactionRequest.getAmount());

        final BiConsumer<User, TransactionRole> lockAccountAndRegisterTransaction = (user, role) -> {
            user.lock();
            userRepository.save(user);

            final Transaction originTransaction = new Transaction();
            originTransaction.setUserId(user.getId());
            originTransaction.setAmount(transactionAmount);
            originTransaction.setRole(role);
            originTransaction.setTransactionId(transactionID);
            transactionRepository.save(originTransaction);
        };

        originUser.ifPresent(user -> lockAccountAndRegisterTransaction.accept(user, TransactionRole.ORIGIN));
        destinationUser.ifPresent(user -> lockAccountAndRegisterTransaction.accept(user, TransactionRole.DESTINATION));

        // Register transaction to confirm later
        TransactionRecord record = new TransactionRecord();
        record.setId(transactionID);
        record.setOriginCBU(transactionRequest.getOriginCBU());
        record.setDestinationCBU(transactionRequest.getDestinationCBU());
        record.setAmount(transactionAmount);
        record.setCompletionDate(null); // confirm later
        transactionHistoryRepository.save(record);
        transactionHistoryRepository.flush();

        return transactionID.toString();
    }

    @PostMapping("/endTransaction")
    @Transactional
    public void endTransaction(@Valid @RequestBody @org.hibernate.validator.constraints.UUID(letterCase = LetterCase.INSENSITIVE) String transactionId){
        Collection<Transaction> transactions = transactionRepository.findDistinctByTransactionId(UUID.fromString(transactionId));
        if(transactions.size() == 0)
            throw new ResourceNotFoundException(String.format("There is no active transaction with id %s", transactionId));

        TransactionRecord record = transactionHistoryRepository.findById(UUID.fromString(transactionId)).orElseThrow(() -> new ResourceNotFoundException("No record of transaction found."));
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
        record.setCompletionDate(LocalDateTime.now());
        transactionHistoryRepository.save(record);
    }

    private static BigDecimal parseBigDecimal(String number){
        return BigDecimal.valueOf(Double.parseDouble(number));
    }

    private User authenticateUser(UserAuthenticationRequest authenticationRequest){
        Optional<User> user = userRepository.findByCbu(authenticationRequest.getCbu());
        if(user.isEmpty())
            throw new SecureUserNotFoundException();
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
