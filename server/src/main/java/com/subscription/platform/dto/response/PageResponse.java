package com.subscription.platform.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.domain.Page;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PageResponse<T> {
    private List<T> data;
    private long total;
    private int page;
    private int pageSize;
    private int totalPages;

    public static <T> PageResponse<T> of(Page<T> page) {
        return PageResponse.<T>builder()
            .data(page.getContent())
            .total(page.getTotalElements())
            .page(page.getNumber() + 1)
            .pageSize(page.getSize())
            .totalPages(page.getTotalPages())
            .build();
    }
}
