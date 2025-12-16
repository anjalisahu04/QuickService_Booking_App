package com.quickServe.backend.Controller;

import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/test")
@CrossOrigin(origins = "http://localhost:3000")
public class TestController {

    @GetMapping("/public")
    public Map<String, Object> publicEndpoint() {
        Map<String, Object> response = new HashMap<>();
        response.put("message", "This is a public endpoint - NO AUTH REQUIRED");
        response.put("timestamp", LocalDateTime.now().toString());
        response.put("status", "SUCCESS");
        System.out.println("✅ Public endpoint accessed successfully");
        return response;
    }

    @PostMapping("/public")
    public Map<String, Object> publicPostEndpoint(@RequestBody Map<String, Object> requestBody) {
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Public POST endpoint working - NO AUTH REQUIRED");
        response.put("received", requestBody);
        response.put("timestamp", LocalDateTime.now().toString());
        response.put("status", "SUCCESS");
        System.out.println("✅ Public POST endpoint accessed successfully");
        return response;
    }
}