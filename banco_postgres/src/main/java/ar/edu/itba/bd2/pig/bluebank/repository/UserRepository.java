package ar.edu.itba.bd2.pig.bluebank.repository;

import ar.edu.itba.bd2.pig.bluebank.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User,Integer> {
    List<User> removeById(int id);
    @Query("select (count(u) > 0) from User u where u.phoneNumber = ?1")
    boolean existsByPhoneNumber(@NonNull String phoneNumber);
    @Query("select (count(u) > 0) from User u where u.email = ?1")
    boolean existsByEmail(@NonNull String email);
    @Transactional
    @Modifying
    @Query("update User u set u.balance = ?1 where u.cbu = ?2")
    int updateBalanceByCbu(@NonNull BigDecimal balance, String cbu);
    Optional<User> findByCbu(String cbu);
}
