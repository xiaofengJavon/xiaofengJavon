package com.subscription.platform.repository;

import com.subscription.platform.entity.CategoryConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryConfigRepository extends JpaRepository<CategoryConfig, String> {

    List<CategoryConfig> findAllByOrderBySortOrderAsc();

    Optional<CategoryConfig> findByName(String name);

    boolean existsByName(String name);

    List<CategoryConfig> findByType(String type);

    @Query("SELECT c FROM CategoryConfig c ORDER BY c.sortOrder ASC")
    List<CategoryConfig> findFirstByOrderBySortOrderAsc();
}
