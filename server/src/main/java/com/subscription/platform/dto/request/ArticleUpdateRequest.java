package com.subscription.platform.dto.request;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;

@Data
public class ArticleUpdateRequest {

    @Size(max = 200, message = "标题最多200字符")
    private String title;

    @Size(max = 500000, message = "内容最多500000字符")
    private String content;

    @Size(max = 50, message = "分类名最多50字符")
    private String category;

    @Pattern(regexp = "^(industry|policy)$", message = "类型必须是 industry 或 policy")
    private String type;

    private Boolean isPremium;

    private Boolean isSticky;

    private LocalDate date;
}
