package com.subscription.platform.dto.request;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;

@Data
public class BatchStickyRequest {
    @NotEmpty(message = "ID列表不能为空")
    @Size(max = 100, message = "批量操作最多100条")
    private List<String> ids;

    @NotNull(message = "置顶状态不能为空")
    private Boolean isSticky;
}
