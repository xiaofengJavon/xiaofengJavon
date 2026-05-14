package com.subscription.platform.controller;

import com.subscription.platform.dto.request.GlobalSettingsUpdateRequest;
import com.subscription.platform.dto.request.UserAdminUpdateRequest;
import com.subscription.platform.dto.response.*;
import com.subscription.platform.entity.GlobalSettings;
import com.subscription.platform.repository.*;
import com.subscription.platform.service.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.io.StringWriter;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Tag(name = "管理后台", description = "后台管理接口（需要管理员权限）")
@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final UserService userService;
    private final UserRepository userRepository;
    private final OrderService orderService;
    private final GlobalSettingsService globalSettingsService;
    private final ArticleRepository articleRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final OrderRepository orderRepository;

    @Operation(summary = "获取Dashboard统计数据")
    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<DashboardStatsResponse>> getDashboard() {
        LocalDate today = LocalDate.now();

        long totalUsers = userRepository.count();
        long vipUsers = userRepository.countVipUsers();
        long totalArticles = articleRepository.countAll();
        long totalOrders = orderRepository.countAll();
        var totalRevenue = orderRepository.calculateTotalRevenue();
        long activeSubs = subscriptionRepository.countTotalActiveSubscribers(today);

        PageRequest top5 = PageRequest.of(0, 5);
        List<ArticleResponse> topArticles = articleRepository.findTopByViewCount(top5).stream()
            .map(a -> ArticleResponse.builder()
                .id(a.getId()).title(a.getTitle()).viewCount(a.getViewCount()).build())
            .collect(Collectors.toList());

        Map<String, Long> subByCategory = new HashMap<>();
        subscriptionRepository.findAll().stream()
            .filter(s -> !s.getExpiryDate().isBefore(today))
            .forEach(s -> subByCategory.merge(s.getCategory(), 1L, Long::sum));

        DashboardStatsResponse stats = DashboardStatsResponse.builder()
            .totalUsers(totalUsers)
            .vipUsers(vipUsers)
            .totalArticles(totalArticles)
            .totalOrders(totalOrders)
            .totalRevenue(totalRevenue)
            .activeSubscriptions(activeSubs)
            .topArticles(topArticles)
            .subscriptionByCategory(subByCategory)
            .build();

        return ResponseEntity.ok(ApiResponse.ok(stats));
    }

    @Operation(summary = "获取用户列表")
    @GetMapping("/users")
    public ResponseEntity<ApiResponse<PageResponse<UserResponse>>> getUsers(
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int pageSize) {

        PageRequest pageable = PageRequest.of(page - 1, Math.min(pageSize, 100),
            Sort.by(Sort.Direction.DESC, "createdAt"));

        Page<UserResponse> usersPage;
        if (search != null && !search.isBlank()) {
            usersPage = userRepository.searchUsers(search, pageable)
                .map(u -> UserResponse.builder()
                    .id(u.getId()).wxOpenid(u.getWxOpenid()).nickname(u.getNickname())
                    .avatarUrl(u.getAvatarUrl()).phone(u.getPhone())
                    .isVip(u.getIsVip())
                    .subscriptionTier(u.getSubscriptionTier()).credits(u.getCredits())
                    .inviteCode(u.getInviteCode()).invitedCount(u.getInvitedCount())
                    .vipExpiry(u.getVipExpiry()).createdAt(u.getCreatedAt()).build());
        } else {
            usersPage = userRepository.findAll(pageable)
                .map(u -> UserResponse.builder()
                    .id(u.getId()).wxOpenid(u.getWxOpenid()).nickname(u.getNickname())
                    .avatarUrl(u.getAvatarUrl()).phone(u.getPhone())
                    .isVip(u.getIsVip())
                    .subscriptionTier(u.getSubscriptionTier()).credits(u.getCredits())
                    .inviteCode(u.getInviteCode()).invitedCount(u.getInvitedCount())
                    .vipExpiry(u.getVipExpiry()).createdAt(u.getCreatedAt()).build());
        }

        return ResponseEntity.ok(ApiResponse.ok(PageResponse.of(usersPage)));
    }

    @Operation(summary = "更新用户信息（管理员）")
    @PutMapping("/users/{id}")
    public ResponseEntity<ApiResponse<UserResponse>> updateUser(
            @PathVariable String id, @RequestBody UserAdminUpdateRequest request) {
        UserResponse response = userService.adminUpdateUser(id, request);
        return ResponseEntity.ok(ApiResponse.ok("用户信息更新成功", response));
    }

    @Operation(summary = "获取订单列表")
    @GetMapping("/orders")
    public ResponseEntity<ApiResponse<PageResponse<OrderResponse>>> getOrders(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateTo,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int pageSize) {
        PageResponse<OrderResponse> response = orderService.getOrders(status, type, dateFrom, dateTo, page, pageSize);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @Operation(summary = "导出订单CSV")
    @GetMapping("/orders/export")
    public ResponseEntity<byte[]> exportOrders(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateTo) {

        List<OrderResponse> orders = orderService.exportOrders(status, type, dateFrom, dateTo);

        StringWriter sw = new StringWriter();
        sw.write("ID,用户ID,用户名,类型,项目,金额,状态,创建时间\n");
        orders.forEach(o -> sw.write(String.format("%s,%s,%s,%s,%s,%s,%s,%s\n",
            o.getId(), o.getUserId(), o.getWxOpenid(), o.getType(),
            o.getItem(), o.getAmount(), o.getStatus(), o.getCreatedAt())));

        byte[] csvBytes = sw.toString().getBytes(java.nio.charset.StandardCharsets.UTF_8);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("text/csv;charset=UTF-8"));
        headers.setContentDispositionFormData("attachment", "orders.csv");
        return ResponseEntity.ok().headers(headers).body(csvBytes);
    }

    @Operation(summary = "获取全局设置")
    @GetMapping("/settings")
    public ResponseEntity<ApiResponse<GlobalSettings>> getSettings() {
        return ResponseEntity.ok(ApiResponse.ok(globalSettingsService.getSettings()));
    }

    @Operation(summary = "更新全局设置")
    @PutMapping("/settings")
    public ResponseEntity<ApiResponse<GlobalSettings>> updateSettings(
            @RequestBody GlobalSettingsUpdateRequest request) {
        GlobalSettings settings = globalSettingsService.updateSettings(request);
        return ResponseEntity.ok(ApiResponse.ok("设置更新成功", settings));
    }

}
