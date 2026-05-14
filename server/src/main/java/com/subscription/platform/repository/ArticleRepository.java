package com.subscription.platform.repository;

import com.subscription.platform.entity.Article;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ArticleRepository extends JpaRepository<Article, String> {

    Page<Article> findByType(String type, Pageable pageable);

    Page<Article> findByCategory(String category, Pageable pageable);

    Page<Article> findByTypeAndCategory(String type, String category, Pageable pageable);

    @Query("SELECT a FROM Article a WHERE " +
           "(:type IS NULL OR a.type = :type) AND " +
           "(:category IS NULL OR a.category = :category) AND " +
           "(:search IS NULL OR a.title LIKE %:search% OR a.summary LIKE %:search%) AND " +
           "(:isPremium IS NULL OR a.isPremium = :isPremium)")
    Page<Article> findWithFilters(
        @Param("type") String type,
        @Param("category") String category,
        @Param("search") String search,
        @Param("isPremium") Boolean isPremium,
        Pageable pageable
    );

    @Query("SELECT a FROM Article a WHERE " +
           "(:type IS NULL OR a.type = :type) AND " +
           "(:category IS NULL OR a.category = :category) AND " +
           "(:search IS NULL OR a.title LIKE %:search% OR a.summary LIKE %:search%) AND " +
           "(a.isPremium = false OR a.id IN :unlockedIds)")
    Page<Article> findAccessibleArticles(
        @Param("type") String type,
        @Param("category") String category,
        @Param("search") String search,
        @Param("unlockedIds") List<String> unlockedIds,
        Pageable pageable
    );

    @Modifying
    @Query("UPDATE Article a SET a.viewCount = a.viewCount + 1 WHERE a.id = :id")
    void incrementViewCount(@Param("id") String id);

    @Modifying
    @Query("UPDATE Article a SET a.viewCount = a.viewCount + :delta WHERE a.id = :id")
    void incrementViewCountBy(@Param("id") String id, @Param("delta") int delta);

    @Modifying
    @Query("UPDATE Article a SET a.favoriteCount = a.favoriteCount + 1 WHERE a.id = :id")
    void incrementFavoriteCount(@Param("id") String id);

    @Modifying
    @Query("UPDATE Article a SET a.favoriteCount = a.favoriteCount - 1 WHERE a.id = :id AND a.favoriteCount > 0")
    void decrementFavoriteCount(@Param("id") String id);

    @Modifying
    @Query("UPDATE Article a SET a.likes = a.likes + 1 WHERE a.id = :id")
    void incrementLikes(@Param("id") String id);

    @Modifying
    @Query("UPDATE Article a SET a.likes = a.likes - 1 WHERE a.id = :id AND a.likes > 0")
    void decrementLikes(@Param("id") String id);

    @Modifying
    @Query("UPDATE Article a SET a.category = :newCategory WHERE a.category = :oldCategory")
    void updateCategoryForAllArticles(@Param("oldCategory") String oldCategory, @Param("newCategory") String newCategory);

    @Query("SELECT COUNT(a) FROM Article a")
    long countAll();

    @Query("SELECT a FROM Article a ORDER BY a.viewCount DESC")
    List<Article> findTopByViewCount(Pageable pageable);
}
