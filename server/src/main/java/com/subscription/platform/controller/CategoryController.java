package com.subscription.platform.controller;

import com.subscription.platform.dto.request.CategoryCreateRequest;
import com.subscription.platform.dto.request.CategoryReorderRequest;
import com.subscription.platform.dto.request.CategoryUpdateRequest;
import com.subscription.platform.dto.response.ApiResponse;
import com.subscription.platform.dto.response.CategoryResponse;
import com.subscription.platform.service.CategoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "分类", description = "文章分类管理接口")
@RestController
@RequestMapping("/api/v1/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    @Operation(summary = "获取所有分类")
    @GetMapping
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getAllCategories() {
        return ResponseEntity.ok(ApiResponse.ok(categoryService.getAllCategories()));
    }

    @Operation(summary = "创建分类（管理员）")
    @PostMapping
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<ApiResponse<CategoryResponse>> createCategory(
            @Valid @RequestBody CategoryCreateRequest request) {
        CategoryResponse response = categoryService.createCategory(request);
        return ResponseEntity.ok(ApiResponse.ok("分类创建成功", response));
    }

    @Operation(summary = "更新分类（管理员）")
    @PutMapping("/{id}")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<ApiResponse<CategoryResponse>> updateCategory(
            @PathVariable String id, @Valid @RequestBody CategoryUpdateRequest request) {
        CategoryResponse response = categoryService.updateCategory(id, request);
        return ResponseEntity.ok(ApiResponse.ok("分类更新成功", response));
    }

    @Operation(summary = "删除分类（管理员）")
    @DeleteMapping("/{id}")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<ApiResponse<Void>> deleteCategory(@PathVariable String id) {
        categoryService.deleteCategory(id);
        return ResponseEntity.ok(ApiResponse.ok("分类删除成功", null));
    }

    @Operation(summary = "分类排序（管理员）")
    @PostMapping("/reorder")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<ApiResponse<Void>> reorderCategories(
            @Valid @RequestBody CategoryReorderRequest request) {
        categoryService.reorderCategories(request.getOrder());
        return ResponseEntity.ok(ApiResponse.ok("排序更新成功", null));
    }
}
