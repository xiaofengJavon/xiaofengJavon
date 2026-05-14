package com.subscription.platform.dto.request;

import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;

@Data
public class CategoryReorderRequest {
    @NotEmpty(message = "排序列表不能为空")
    private List<String> order;
}
