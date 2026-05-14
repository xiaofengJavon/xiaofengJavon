package com.subscription.platform.repository;

import com.subscription.platform.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, String> {

    Optional<User> findByWxOpenid(String wxOpenid);

    Optional<User> findByInviteCode(String inviteCode);

    boolean existsByWxOpenid(String wxOpenid);

    boolean existsByInviteCode(String inviteCode);

    @Query("SELECT COUNT(u) FROM User u WHERE u.isVip = true")
    long countVipUsers();

    @Query("SELECT u FROM User u WHERE u.wxOpenid LIKE %:keyword% OR u.inviteCode LIKE %:keyword%")
    Page<User> searchUsers(@Param("keyword") String keyword, Pageable pageable);

    @Modifying
    @Query("UPDATE User u SET u.credits = u.credits + :amount WHERE u.id = :userId")
    void addCredits(@Param("userId") String userId, @Param("amount") int amount);

    @Modifying
    @Query("UPDATE User u SET u.credits = u.credits - :amount WHERE u.id = :userId AND u.credits >= :amount")
    int deductCredits(@Param("userId") String userId, @Param("amount") int amount);
}
