package com.subscription.platform.repository;

import com.subscription.platform.entity.Subscription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface SubscriptionRepository extends JpaRepository<Subscription, String> {

    List<Subscription> findByUserId(String userId);

    Optional<Subscription> findByUserIdAndCategory(String userId, String category);

    @Query("SELECT s FROM Subscription s WHERE s.user.id = :userId AND s.expiryDate >= :today")
    List<Subscription> findActiveSubscriptionsByUserId(@Param("userId") String userId, @Param("today") LocalDate today);

    @Query("SELECT CASE WHEN COUNT(s) > 0 THEN true ELSE false END FROM Subscription s " +
           "WHERE s.user.id = :userId AND s.category = :category AND s.expiryDate >= :today")
    boolean hasActiveSubscription(@Param("userId") String userId, @Param("category") String category, @Param("today") LocalDate today);

    @Query("SELECT COUNT(DISTINCT s.user.id) FROM Subscription s WHERE s.category = :category AND s.expiryDate >= :today")
    long countActiveSubscribersByCategory(@Param("category") String category, @Param("today") LocalDate today);

    @Query("SELECT COUNT(DISTINCT s.user.id) FROM Subscription s WHERE s.expiryDate >= :today")
    long countTotalActiveSubscribers(@Param("today") LocalDate today);
}
