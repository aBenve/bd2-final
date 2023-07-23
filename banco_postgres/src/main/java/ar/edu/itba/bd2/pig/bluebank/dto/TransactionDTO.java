package ar.edu.itba.bd2.pig.bluebank.dto;

import ar.edu.itba.bd2.pig.bluebank.model.Transaction;

public class TransactionDTO {
    private String transactionId;
    private String status;
    private String amount;

    public static TransactionDTO fromTransaction(Transaction transaction){
        final TransactionDTO transactionDto = new TransactionDTO();

        transactionDto.transactionId = transaction.getTransactionId().toString();
        transactionDto.status = transaction.isCompleted()? "completed" : "pending";
        transactionDto.amount = transaction.getAmount().toPlainString();

        return transactionDto;
    }

    public TransactionDTO() {
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
