package com.subscription.platform.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;

@Data
public class BatchCategoryRequest {
    @NotEmpty(message = "ID列表不能为空")
    @Size(max = 100, message = "批量操作最多100条")
    private List<String> ids;

    @NotBlank(message = "分类不能为空")
    private String category;
}
