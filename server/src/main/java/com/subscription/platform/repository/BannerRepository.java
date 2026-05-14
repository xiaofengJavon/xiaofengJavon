package com.subscription.platform.repository;

import com.subscription.platform.entity.Banner;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface BannerRepository extends JpaRepository<Banner, String> {

    /**
     * 查询所有轮播图，按排序顺序升序
     */
    List<Banner> findAllByOrderBySortOrderAsc();

    /**
     * 查询启用的轮播图，按排序顺序升序
     */
    List<Banner> findByIsEnabledTrueOrderBySortOrderAsc();

    /**
     * 查询当前有效的轮播图（启用且在有效期内）
     */
    @Query("SELECT b FROM Banner b WHERE b.isEnabled = true " +
           "AND (b.startDate IS NULL OR b.startDate <= :currentDate) " +
           "AND (b.endDate IS NULL OR b.endDate >= :currentDate) " +
           "ORDER BY b.sortOrder ASC")
    List<Banner> findActiveBanners(LocalDate currentDate);
}
