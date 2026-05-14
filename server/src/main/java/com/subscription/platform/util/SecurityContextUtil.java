package com.subscription.platform.util;

import com.subscription.platform.security.UserPrincipal;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

public class SecurityContextUtil {

    public static UserPrincipal getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof UserPrincipal) {
            return (UserPrincipal) authentication.getPrincipal();
        }
        return null;
    }

    public static String getCurrentUserId() {
        UserPrincipal principal = getCurrentUser();
        return principal != null ? principal.getUserId() : null;
    }

    public static boolean isAdmin() {
        UserPrincipal principal = getCurrentUser();
        return principal != null && principal.isAdmin();
    }
}
