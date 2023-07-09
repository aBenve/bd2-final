package ar.edu.itba.bd2.pig.bluebank.repository;

import ar.edu.itba.bd2.pig.bluebank.model.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, UUID> {

}
