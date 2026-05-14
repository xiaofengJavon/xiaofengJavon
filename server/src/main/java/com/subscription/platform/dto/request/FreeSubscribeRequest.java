package com.subscription.platform.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class FreeSubscribeRequest {

    @NotBlank(message = "分类名称不能为空")
    private String category;
}
