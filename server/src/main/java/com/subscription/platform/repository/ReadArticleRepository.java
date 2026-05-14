package com.subscription.platform.repository;

import com.subscription.platform.entity.ReadArticle;
import com.subscription.platform.entity.ReadArticleId;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ReadArticleRepository extends JpaRepository<ReadArticle, ReadArticleId> {

    boolean existsByIdUserIdAndIdArticleId(String userId, String articleId);

    long countByIdUserId(String userId);

    @Query("SELECT ra FROM ReadArticle ra WHERE ra.id.userId = :userId ORDER BY ra.createdAt DESC")
    Page<ReadArticle> findByUserId(@Param("userId") String userId, Pageable pageable);
}
