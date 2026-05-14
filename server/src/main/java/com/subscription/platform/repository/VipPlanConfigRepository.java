package com.subscription.platform.repository;

import com.subscription.platform.entity.VipPlanConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VipPlanConfigRepository extends JpaRepository<VipPlanConfig, String> {
    
    /**
     * 根据套餐标识查询
     */
    Optional<VipPlanConfig> findByPlanKey(String planKey);
    
    /**
     * 查询所有启用的套餐，按排序顺序
     */
    List<VipPlanConfig> findByIsEnabledTrueOrderBySortOrderAsc();
    
    /**
     * 查询所有套餐，按排序顺序
     */
    List<VipPlanConfig> findAllByOrderBySortOrderAsc();
}
