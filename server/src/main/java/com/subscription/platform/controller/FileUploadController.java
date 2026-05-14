package com.subscription.platform.controller;

import com.subscription.platform.dto.response.ApiResponse;
import com.subscription.platform.service.FileStorageService;
import com.subscription.platform.service.FileStorageService.ImageType;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Tag(name = "文件上传", description = "文件上传接口")
@RestController
@RequestMapping("/api/v1/upload")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
public class FileUploadController {

    private final FileStorageService fileStorageService;

    @Operation(summary = "上传图片（通用）", description = "支持多种图片类型上传，自动分类存储")
    @PostMapping(consumes = "multipart/form-data")
    public ResponseEntity<ApiResponse<Map<String, Object>>> uploadImage(
            @Parameter(description = "图片文件", required = true)
            @RequestParam("file") MultipartFile file,
            @Parameter(description = "图片类型：avatar(头像), banner(轮播图), article(文章), category(分类), poster(海报), editor(编辑器), other(其他)")
            @RequestParam(value = "type", defaultValue = "other") String type) {
        
        log.info("收到图片上传请求: type={}, filename={}, size={}", 
            type, file.getOriginalFilename(), fileStorageService.getFormattedFileSize(file.getSize()));
        
        // 解析图片类型
        ImageType imageType;
        try {
            imageType = ImageType.valueOf(type.toUpperCase());
        } catch (IllegalArgumentException e) {
            imageType = ImageType.OTHER;
            log.warn("未知的图片类型: {}, 使用默认类型: OTHER", type);
        }
        
        // 上传文件
        String url = fileStorageService.store(file, imageType);
        
        // 构建响应
        Map<String, Object> result = new HashMap<>();
        result.put("url", url);
        result.put("filename", file.getOriginalFilename());
        result.put("size", file.getSize());
        result.put("type", imageType.name().toLowerCase());
        
        return ResponseEntity.ok(ApiResponse.ok("上传成功", result));
    }

    @Operation(summary = "上传头像", description = "用户头像上传")
    @PostMapping(value = "/avatar", consumes = "multipart/form-data")
    public ResponseEntity<ApiResponse<Map<String, Object>>> uploadAvatar(
            @Parameter(description = "头像文件", required = true)
            @RequestParam("file") MultipartFile file) {
        
        log.info("上传头像: filename={}, size={}", 
            file.getOriginalFilename(), fileStorageService.getFormattedFileSize(file.getSize()));
        
        String url = fileStorageService.store(file, ImageType.AVATAR);
        
        Map<String, Object> result = new HashMap<>();
        result.put("url", url);
        result.put("filename", file.getOriginalFilename());
        result.put("size", file.getSize());
        
        return ResponseEntity.ok(ApiResponse.ok("头像上传成功", result));
    }

    @Operation(summary = "上传轮播图", description = "Banner轮播图上传")
    @PostMapping(value = "/banner", consumes = "multipart/form-data")
    public ResponseEntity<ApiResponse<Map<String, Object>>> uploadBanner(
            @Parameter(description = "轮播图文件", required = true)
            @RequestParam("file") MultipartFile file) {
        
        log.info("上传轮播图: filename={}, size={}", 
            file.getOriginalFilename(), fileStorageService.getFormattedFileSize(file.getSize()));
        
        String url = fileStorageService.store(file, ImageType.BANNER);
        
        Map<String, Object> result = new HashMap<>();
        result.put("url", url);
        result.put("filename", file.getOriginalFilename());
        result.put("size", file.getSize());
        
        return ResponseEntity.ok(ApiResponse.ok("轮播图上传成功", result));
    }

    @Operation(summary = "上传文章图片", description = "文章封面或内容图片上传")
    @PostMapping(value = "/article", consumes = "multipart/form-data")
    public ResponseEntity<ApiResponse<Map<String, Object>>> uploadArticleImage(
            @Parameter(description = "文章图片文件", required = true)
            @RequestParam("file") MultipartFile file) {
        
        log.info("上传文章图片: filename={}, size={}", 
            file.getOriginalFilename(), fileStorageService.getFormattedFileSize(file.getSize()));
        
        String url = fileStorageService.store(file, ImageType.ARTICLE);
        
        Map<String, Object> result = new HashMap<>();
        result.put("url", url);
        result.put("filename", file.getOriginalFilename());
        result.put("size", file.getSize());
        
        return ResponseEntity.ok(ApiResponse.ok("文章图片上传成功", result));
    }

    @Operation(summary = "上传富文本编辑器图片", description = "富文本编辑器中的图片上传")
    @PostMapping(value = "/editor", consumes = "multipart/form-data")
    public ResponseEntity<ApiResponse<Map<String, Object>>> uploadEditorImage(
            @Parameter(description = "编辑器图片文件", required = true)
            @RequestParam("file") MultipartFile file) {
        
        log.info("上传编辑器图片: filename={}, size={}", 
            file.getOriginalFilename(), fileStorageService.getFormattedFileSize(file.getSize()));
        
        String url = fileStorageService.store(file, ImageType.EDITOR);
        
        Map<String, Object> result = new HashMap<>();
        result.put("url", url);
        result.put("filename", file.getOriginalFilename());
        result.put("size", file.getSize());
        
        return ResponseEntity.ok(ApiResponse.ok("编辑器图片上传成功", result));
    }

    @Operation(summary = "删除图片", description = "删除已上传的图片")
    @DeleteMapping
    public ResponseEntity<ApiResponse<Void>> deleteImage(
            @Parameter(description = "图片URL", required = true)
            @RequestParam("url") String url) {
        
        log.info("删除图片: url={}", url);
        
        boolean success = fileStorageService.delete(url);
        if (success) {
            return ResponseEntity.ok(ApiResponse.ok("删除成功", null));
        } else {
            return ResponseEntity.ok(ApiResponse.error("DELETE_FAILED", "删除失败或文件不存在"));
        }
    }

    @Operation(summary = "获取图片列表", description = "获取已上传的图片列表")
    @GetMapping("/list")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> listImages(
            @Parameter(description = "图片类型：avatar, banner, article, category, poster, editor, other, all")
            @RequestParam(value = "type", defaultValue = "all") String type) {
        
        log.info("获取图片列表: type={}", type);
        
        List<FileStorageService.ImageInfo> images = fileStorageService.listImages(type);
        
        // 转换为Map格式
        List<Map<String, Object>> result = images.stream()
            .map(img -> {
                Map<String, Object> map = new HashMap<>();
                map.put("name", img.getName());
                map.put("url", img.getUrl());
                map.put("size", img.getSize());
                map.put("type", img.getType());
                map.put("uploadTime", img.getUploadTime());
                return map;
            })
            .collect(Collectors.toList());
        
        return ResponseEntity.ok(ApiResponse.ok("获取成功", result));
    }
}
