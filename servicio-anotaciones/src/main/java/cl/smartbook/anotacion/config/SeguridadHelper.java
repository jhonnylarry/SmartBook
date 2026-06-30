package cl.smartbook.anotacion.config;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

public class SeguridadHelper {

    private SeguridadHelper() {}

    public static String getRolActual() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) return null;
        return auth.getAuthorities().stream()
                .map(a -> a.getAuthority())
                .filter(a -> a.startsWith("ROLE_"))
                .map(a -> a.substring(5))
                .findFirst()
                .orElse(null);
    }

    public static Long getUserIdActual() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getDetails() == null) return null;
        try {
            return Long.parseLong(auth.getDetails().toString());
        } catch (NumberFormatException e) {
            return null;
        }
    }
}
