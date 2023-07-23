package ar.edu.itba.bd2.pig.bluebank.repository;

import ar.edu.itba.bd2.pig.bluebank.model.TransactionRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface TransactionHistoryRepository extends JpaRepository<TransactionRecord, UUID> {
}
