package com.subscription.platform.repository;

import com.subscription.platform.entity.AdminUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AdminUserRepository extends JpaRepository<AdminUser, String> {

    Optional<AdminUser> findByUsername(String username);

    boolean existsByUsername(String username);
}
