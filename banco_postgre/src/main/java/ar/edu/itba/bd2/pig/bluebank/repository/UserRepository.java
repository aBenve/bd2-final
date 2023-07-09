package ar.edu.itba.bd2.pig.bluebank.repository;

import ar.edu.itba.bd2.pig.bluebank.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends JpaRepository<User,Integer> {
}
