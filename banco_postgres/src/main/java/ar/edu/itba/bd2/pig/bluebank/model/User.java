package ar.edu.itba.bd2.pig.bluebank.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Digits;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.Generated;

import java.math.BigDecimal;
import java.util.Objects;
import java.util.UUID;

@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(columnDefinition = "serial")
    private int id;
    @Column(name = "cbu", length = 22, nullable = false, unique = true)
    private String cbu;
    @Column(name = "name", nullable = false)
    private String name;
    @Column(name = "email", nullable = false)
    private String email;
    @Column(name = "phone_number", length = 10, nullable = false)
    private String phoneNumber;
    @Column(name = "balance", nullable = false)
    @Digits(integer = 17, fraction = 2)
    private BigDecimal balance = BigDecimal.ZERO;
    @Column(name = "password_hash")
    private String passwordHash;
    @Column(name = "is_blocked")
    private boolean isBlocked = false;
    @Column(name = "secret_token", unique = true, nullable = false, columnDefinition = "default gen_random_uuid()")
    @ColumnDefault(value = "gen_random_uuid()")
    @Generated
    private UUID token;
    @OneToOne(mappedBy = "user", optional = true, cascade = CascadeType.ALL)
    private Transaction activeTransaction;

    public User(){
        super();
    }

    public User(String cbu, String name, String email, String phoneNumber, String passwordHash) {
        this.cbu = cbu;
        this.name = name;
        this.email = email;
        this.phoneNumber = phoneNumber;
        this.passwordHash = passwordHash;
    }

    public void lock(){
        this.isBlocked = true;
    }
    public void unlock(){
        this.isBlocked = false;
    }
    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getCbu() {
        return cbu;
    }

    public void setCbu(String cbu) {
        this.cbu = cbu;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public BigDecimal getBalance() {
        return balance;
    }

    public void setBalance(BigDecimal balance) {
        this.balance = balance;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }

    public boolean isBlocked() {
        return isBlocked;
    }

    public void setBlocked(boolean blocked) {
        isBlocked = blocked;
    }

    public UUID getToken() {
        return token;
    }

    public void setToken(UUID token) {
        this.token = token;
    }

    public Transaction getActiveTransaction() {
        return activeTransaction;
    }

    public void setActiveTransaction(Transaction activeTransaction) {
        this.activeTransaction = activeTransaction;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof User user)) return false;
        return id == user.id;
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
