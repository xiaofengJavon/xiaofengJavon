package com.subscription.platform.repository;

import com.subscription.platform.entity.UnlockedArticle;
import com.subscription.platform.entity.UnlockedArticleId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UnlockedArticleRepository extends JpaRepository<UnlockedArticle, UnlockedArticleId> {

    boolean existsByIdUserIdAndIdArticleId(String userId, String articleId);

    long countByIdUserId(String userId);

    @Query("SELECT ua.id.articleId FROM UnlockedArticle ua WHERE ua.id.userId = :userId")
    List<String> findArticleIdsByUserId(@Param("userId") String userId);
}
