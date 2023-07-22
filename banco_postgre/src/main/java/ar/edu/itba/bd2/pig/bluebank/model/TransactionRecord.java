package ar.edu.itba.bd2.pig.bluebank.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.validation.constraints.Digits;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Objects;
import java.util.UUID;

@Entity(name="transaction_history")
public class TransactionRecord {
    @Id
    UUID id;
    @Column(name = "origin_cbu", nullable = false, insertable = false)
    String originCBU;
    @Column(name = "destination_cbu", nullable = false, insertable = false)
    String destinationCBU;
    @Column(name = "amount", nullable = false, insertable = false)
    @Digits(integer = 17, fraction = 2)
    BigDecimal amount;
    @Column(name = "completion_date")
    LocalDateTime completionDate;

    public TransactionRecord() {
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getOriginCBU() {
        return originCBU;
    }

    public void setOriginCBU(String originCBU) {
        this.originCBU = originCBU;
    }

    public String getDestinationCBU() {
        return destinationCBU;
    }

    public void setDestinationCBU(String destinationCBU) {
        this.destinationCBU = destinationCBU;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public LocalDateTime getCompletionDate() {
        return completionDate;
    }

    public void setCompletionDate(LocalDateTime completionDate) {
        this.completionDate = completionDate;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof TransactionRecord that)) return false;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
