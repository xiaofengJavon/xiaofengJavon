package com.subscription.platform.repository;

import com.subscription.platform.entity.Referral;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReferralRepository extends JpaRepository<Referral, String> {

    boolean existsByReferredId(String referredId);

    List<Referral> findByReferrerId(String referrerId);

    Optional<Referral> findByReferredId(String referredId);
}
