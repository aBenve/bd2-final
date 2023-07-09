package ar.edu.itba.bd2.pig.bluebank.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Digits;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "user_active_transactions")
public class Transaction {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID transactionId;
    @Column(name = "user_id", unique = true, nullable = false)
    private int userId;
    @OneToOne(fetch = FetchType.LAZY, cascade = {}, optional = false)
    @JoinColumn(name = "user_id", unique = true, nullable = false, insertable = false, updatable = false)
    private User user;
    @Column(name = "amount", nullable = false)
    @Digits(integer = 17, fraction = 2)
    private BigDecimal amount;
    @Column(name = "is_completed")
    private boolean isCompleted;

    public Transaction() {
        super();
    }

    public void complete(){
        this.isCompleted = true;
    }
    public UUID getTransactionId() {
        return transactionId;
    }

    public void setTransactionId(UUID transactionId) {
        this.transactionId = transactionId;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public int getUserId() {
        return userId;
    }

    public void setUserId(int userId) {
        this.userId = userId;
    }

    public boolean isCompleted() {
        return isCompleted;
    }

    public void setCompleted(boolean completed) {
        isCompleted = completed;
    }
}
