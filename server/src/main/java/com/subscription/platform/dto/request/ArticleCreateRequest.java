package com.subscription.platform.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;

@Data
public class ArticleCreateRequest {

    @NotBlank(message = "标题不能为空")
    @Size(max = 200, message = "标题最多200字符")
    private String title;

    @NotBlank(message = "内容不能为空")
    @Size(max = 500000, message = "内容最多500000字符")
    private String content;

    @NotBlank(message = "分类不能为空")
    @Size(max = 50, message = "分类名最多50字符")
    private String category;

    @NotBlank(message = "类型不能为空")
    @Pattern(regexp = "^(industry|policy)$", message = "类型必须是 industry 或 policy")
    private String type;

    private Boolean isPremium = false;

    private Boolean isSticky = false;

    private LocalDate date;
}
