package com.subscription.platform.repository;

import com.subscription.platform.entity.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, String> {

    List<Order> findByUser_Id(String userId);

    Page<Order> findByUser_IdOrderByCreatedAtDesc(String userId, Pageable pageable);

    Page<Order> findByStatus(String status, Pageable pageable);

    Page<Order> findByType(String type, Pageable pageable);

    Optional<Order> findByWechatPrepayId(String prepayId);

    @Query("SELECT o FROM Order o WHERE " +
           "(:status IS NULL OR o.status = :status) AND " +
           "(:type IS NULL OR o.type = :type) AND " +
           "(:dateFrom IS NULL OR o.createdAt >= :dateFrom) AND " +
           "(:dateTo IS NULL OR o.createdAt <= :dateTo)")
    Page<Order> findWithFilters(
        @Param("status") String status,
        @Param("type") String type,
        @Param("dateFrom") LocalDateTime dateFrom,
        @Param("dateTo") LocalDateTime dateTo,
        Pageable pageable
    );

    @Query("SELECT o FROM Order o WHERE o.user.id = :userId AND " +
           "(:status IS NULL OR o.status = :status) AND " +
           "(:search IS NULL OR LOWER(o.item) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
           "(:dateFrom IS NULL OR o.createdAt >= :dateFrom) AND " +
           "(:dateTo IS NULL OR o.createdAt <= :dateTo)")
    Page<Order> findByUserIdWithFilters(
        @Param("userId") String userId,
        @Param("status") String status,
        @Param("search") String search,
        @Param("dateFrom") LocalDateTime dateFrom,
        @Param("dateTo") LocalDateTime dateTo,
        Pageable pageable
    );

    @Query("SELECT o FROM Order o WHERE " +
           "(:status IS NULL OR o.status = :status) AND " +
           "(:type IS NULL OR o.type = :type) AND " +
           "(:dateFrom IS NULL OR o.createdAt >= :dateFrom) AND " +
           "(:dateTo IS NULL OR o.createdAt <= :dateTo)")
    List<Order> findAllWithFilters(
        @Param("status") String status,
        @Param("type") String type,
        @Param("dateFrom") LocalDateTime dateFrom,
        @Param("dateTo") LocalDateTime dateTo
    );

    @Query("SELECT COALESCE(SUM(o.amount), 0) FROM Order o WHERE o.status = 'PAID'")
    BigDecimal calculateTotalRevenue();

    @Query("SELECT COUNT(o) FROM Order o")
    long countAll();
}
