package com.subscription.platform.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;

@Data
public class BannerRequest {

    @NotBlank(message = "标题不能为空")
    @Size(max = 100, message = "标题最多100个字符")
    private String title;

    @NotBlank(message = "图片URL不能为空")
    @Size(max = 500, message = "图片URL最多500个字符")
    private String imageUrl;

    @Size(max = 500, message = "链接URL最多500个字符")
    private String linkUrl;

    @NotBlank(message = "链接类型不能为空")
    private String linkType; // none, article, external, category

    @Size(max = 100, message = "链接目标最多100个字符")
    private String linkTarget;

    @NotNull(message = "排序顺序不能为空")
    @Min(value = 0, message = "排序顺序不能小于0")
    private Integer sortOrder;

    @NotNull(message = "启用状态不能为空")
    private Boolean isEnabled;

    private LocalDate startDate;

    private LocalDate endDate;
}
