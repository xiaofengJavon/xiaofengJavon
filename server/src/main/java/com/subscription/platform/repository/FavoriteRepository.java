package com.subscription.platform.repository;

import com.subscription.platform.entity.Favorite;
import com.subscription.platform.entity.FavoriteId;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface FavoriteRepository extends JpaRepository<Favorite, FavoriteId> {

    boolean existsByIdUserIdAndIdArticleId(String userId, String articleId);

    long countByIdUserId(String userId);

    @Query("SELECT f FROM Favorite f WHERE f.id.userId = :userId ORDER BY f.createdAt DESC")
    Page<Favorite> findByUserId(@Param("userId") String userId, Pageable pageable);

    void deleteByIdUserIdAndIdArticleId(String userId, String articleId);
}
