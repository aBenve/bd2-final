package ar.edu.itba.bd2.pig.bluebank.Dto;

import ar.edu.itba.bd2.pig.bluebank.model.Transaction;

import java.math.BigDecimal;

public class TransactionDto {
    private String transactionId;
    private String status;
    private String amount;

    public static TransactionDto fromTransaction(Transaction transaction){
        final TransactionDto transactionDto = new TransactionDto();

        transactionDto.transactionId = transaction.getTransactionId().toString();
        transactionDto.status = transaction.isCompleted()? "completed" : "pending";
        transactionDto.amount = transaction.getAmount().toPlainString();

        return transactionDto;
    }

    public TransactionDto() {
        super();
    }

    public String getTransactionId() {
        return transactionId;
    }

    public void setTransactionId(String transactionId) {
        this.transactionId = transactionId;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
