package com.quickServe.backend.Controller;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/debug")
public class DebugController {

    @GetMapping("/auth-test")
    public Map<String, Object> authTest(Authentication authentication) {
        Map<String, Object> response = new HashMap<>();
        response.put("authenticated", authentication != null);
        if (authentication != null) {
            response.put("username", authentication.getName());
            response.put("authorities", authentication.getAuthorities());
            response.put("principal", authentication.getPrincipal().getClass().getSimpleName());
        }
        return response;
    }
}