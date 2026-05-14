package com.subscription.platform.controller;

import com.subscription.platform.dto.request.*;
import com.subscription.platform.dto.response.ApiResponse;
import com.subscription.platform.dto.response.ArticleResponse;
import com.subscription.platform.dto.response.PageResponse;
import com.subscription.platform.service.ArticleService;
import com.subscription.platform.util.SecurityContextUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Tag(name = "文章", description = "文章管理相关接口")
@RestController
@RequestMapping("/api/v1/articles")
@RequiredArgsConstructor
public class ArticleController {

    private final ArticleService articleService;

    @Operation(summary = "获取浏览量 Top N 排行榜")
    @GetMapping("/top")
    public ResponseEntity<ApiResponse<List<ArticleResponse>>> getTopArticles(
            @RequestParam(defaultValue = "10") int limit) {
        String userId = SecurityContextUtil.getCurrentUserId();
        List<ArticleResponse> response = articleService.getTopArticles(limit, userId);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @Operation(summary = "获取文章列表")
    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<ArticleResponse>>> getArticles(
            @Parameter(description = "文章类型: industry/policy") @RequestParam(required = false) String type,
            @Parameter(description = "分类名称") @RequestParam(required = false) String category,
            @Parameter(description = "搜索关键词") @RequestParam(required = false) String search,
            @Parameter(description = "仅订阅内容") @RequestParam(required = false) Boolean subscribedOnly,
            @Parameter(description = "页码，从1开始") @RequestParam(defaultValue = "1") int page,
            @Parameter(description = "每页数量，最大100") @RequestParam(defaultValue = "20") int pageSize) {
        String userId = SecurityContextUtil.getCurrentUserId();
        PageResponse<ArticleResponse> response = articleService.getArticles(
            type, category, search, subscribedOnly, page, pageSize, userId);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @Operation(summary = "获取文章详情")
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ArticleResponse>> getArticle(@PathVariable String id) {
        String userId = SecurityContextUtil.getCurrentUserId();
        ArticleResponse response = articleService.getArticleById(id, userId);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @Operation(summary = "获取文章详情（管理员，无权限检查）")
    @GetMapping("/admin/{id}")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<ApiResponse<ArticleResponse>> getArticleForAdmin(@PathVariable String id) {
        ArticleResponse response = articleService.getArticleByIdForAdmin(id);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @Operation(summary = "记录文章浏览")
    @PostMapping("/{id}/view")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<ApiResponse<Void>> recordView(@PathVariable String id) {
        String userId = SecurityContextUtil.getCurrentUserId();
        articleService.recordView(id, userId);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }

    @Operation(summary = "收藏/取消收藏文章")
    @PostMapping("/{id}/favorite")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<ApiResponse<Map<String, Object>>> toggleFavorite(@PathVariable String id) {
        String userId = SecurityContextUtil.getCurrentUserId();
        boolean isFavorited = articleService.toggleFavorite(id, userId);
        return ResponseEntity.ok(ApiResponse.ok(Map.of("isFavorited", isFavorited)));
    }

    @Operation(summary = "点赞文章")
    @PostMapping("/{id}/like")
    public ResponseEntity<ApiResponse<Void>> toggleLike(@PathVariable String id) {
        articleService.toggleLike(id);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }

    @Operation(summary = "分享解锁文章")
    @PostMapping("/{id}/unlock")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<ApiResponse<Void>> unlockArticle(@PathVariable String id) {
        String userId = SecurityContextUtil.getCurrentUserId();
        articleService.unlockArticle(id, userId);
        return ResponseEntity.ok(ApiResponse.ok("解锁成功", null));
    }

    @Operation(summary = "创建文章（管理员）")
    @PostMapping
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<ApiResponse<ArticleResponse>> createArticle(
            @Valid @RequestBody ArticleCreateRequest request) {
        ArticleResponse response = articleService.createArticle(request);
        return ResponseEntity.ok(ApiResponse.ok("文章创建成功", response));
    }

    @Operation(summary = "更新文章（管理员）")
    @PutMapping("/{id}")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<ApiResponse<ArticleResponse>> updateArticle(
            @PathVariable String id, @Valid @RequestBody ArticleUpdateRequest request) {
        ArticleResponse response = articleService.updateArticle(id, request);
        return ResponseEntity.ok(ApiResponse.ok("文章更新成功", response));
    }

    @Operation(summary = "删除文章（管理员）")
    @DeleteMapping("/{id}")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<ApiResponse<Void>> deleteArticle(@PathVariable String id) {
        articleService.deleteArticle(id);
        return ResponseEntity.ok(ApiResponse.ok("文章删除成功", null));
    }

    @Operation(summary = "批量删除文章（管理员）")
    @PostMapping("/batch-delete")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<ApiResponse<Void>> batchDelete(@Valid @RequestBody BatchIdsRequest request) {
        articleService.batchDelete(request.getIds());
        return ResponseEntity.ok(ApiResponse.ok("批量删除成功", null));
    }

    @Operation(summary = "批量修改分类（管理员）")
    @PostMapping("/batch-category")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<ApiResponse<Void>> batchCategory(@Valid @RequestBody BatchCategoryRequest request) {
        articleService.batchUpdateCategory(request.getIds(), request.getCategory());
        return ResponseEntity.ok(ApiResponse.ok("批量修改分类成功", null));
    }

    @Operation(summary = "批量设置置顶（管理员）")
    @PostMapping("/batch-sticky")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<ApiResponse<Void>> batchSticky(@Valid @RequestBody BatchStickyRequest request) {
        articleService.batchUpdateSticky(request.getIds(), request.getIsSticky());
        return ResponseEntity.ok(ApiResponse.ok("批量操作成功", null));
    }
}
