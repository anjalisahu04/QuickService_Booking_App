package com.quickServe.backend.Controller;

import com.quickServe.backend.Model.Review;
import com.quickServe.backend.Model.User;
import com.quickServe.backend.Payload.request.ReviewRequest;
import com.quickServe.backend.Payload.response.ReviewResponse;
import com.quickServe.backend.Security.service.UserDetailsServiceImpl;
import com.quickServe.backend.Service.ReviewService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import com.quickServe.backend.Repository.ReviewRepository;
import com.quickServe.backend.Repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/reviews")
@CrossOrigin(origins = "http://localhost:3000")
public class ReviewController {

    @Autowired
    private ReviewService reviewService;

    @Autowired
    private UserDetailsServiceImpl userDetailsService;
     @Autowired
    private UserRepository userRepository;

    @Autowired
    private ReviewRepository reviewRepository;

    private String getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        System.out.println("=== AUTHENTICATION DEBUG ===");
        System.out.println("Authentication: " + authentication);
        System.out.println("Principal: " + (authentication != null ? authentication.getPrincipal() : "null"));
        
        if (authentication != null && authentication.isAuthenticated()) {
            if (authentication.getPrincipal() instanceof UserDetails) {
                UserDetails userDetails = (UserDetails) authentication.getPrincipal();
                System.out.println("Username: " + userDetails.getUsername());
                System.out.println("Authorities: " + userDetails.getAuthorities());
                return userDetailsService.getUserIdByEmail(userDetails.getUsername());
            } else if (authentication.getPrincipal() instanceof String) {
                // Handle string principal (username)
                String username = (String) authentication.getPrincipal();
                if (!username.equals("anonymousUser")) {
                    return userDetailsService.getUserIdByEmail(username);
                }
            }
        }
        
        System.out.println("❌ User not properly authenticated");
        throw new RuntimeException("User not authenticated");
    }

    @GetMapping("/test")
    public Map<String, Object> testEndpoint() {
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Review API is working - NO AUTH REQUIRED");
        response.put("timestamp", LocalDateTime.now().toString());
        response.put("status", "SUCCESS");
        System.out.println("✅ /api/reviews/test endpoint accessed successfully!");
        return response;
    }

    @PostMapping
    public ResponseEntity<?> createReview(@Valid @RequestBody ReviewRequest reviewRequest) {
        try {
            System.out.println("=== REVIEW SUBMISSION ===");
            System.out.println("Booking ID: " + reviewRequest.getBookingId());
            System.out.println("Provider ID: " + reviewRequest.getProviderId());
            System.out.println("Rating: " + reviewRequest.getRating());
            System.out.println("Comment: " + reviewRequest.getComment());
            
            String userId = getCurrentUserId();
            System.out.println("Authenticated User ID: " + userId);
            
            Review review = reviewService.createReview(userId, reviewRequest);
            
            ReviewResponse reviewResponse = new ReviewResponse(
                review.getId(),
                review.getUser().getName(),
                review.getRating(),
                review.getComment(),
                review.getCreatedAt(),
                review.getBooking().getId(),
                review.getBooking().getServiceType()
            );
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Review submitted successfully!");
            response.put("review", reviewResponse);
            response.put("status", "SUCCESS");
            response.put("timestamp", LocalDateTime.now().toString());
            
            System.out.println("✅ Review created successfully: " + review.getId());
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.out.println("❌ Error processing review: " + e.getMessage());
            e.printStackTrace();
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            errorResponse.put("timestamp", LocalDateTime.now().toString());
            errorResponse.put("status", "ERROR");
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
    @GetMapping("/provider/{providerId}/test")
    public Map<String, Object> testProviderReviews(@PathVariable String providerId) {
        Map<String, Object> response = new HashMap<>();
    
    try {
        System.out.println("=== TESTING PROVIDER REVIEWS ENDPOINT ===");
        System.out.println("Provider ID: " + providerId);
        
        User provider = userRepository.findById(providerId).orElse(null);
        response.put("providerExists", provider != null);
        if (provider != null) {
            response.put("providerName", provider.getName());
        }
        
        long reviewCount = reviewRepository.countByProviderId(providerId);
        response.put("reviewCount", reviewCount);
        
        List<Review> reviews = reviewRepository.findByProviderId(providerId);
        response.put("reviewsFound", reviews.size());
        response.put("reviews", reviews.stream()
                .map(r -> Map.of(
                    "id", r.getId(),
                    "rating", r.getRating(),
                    "comment", r.getComment(),
                    "user", r.getUser() != null ? r.getUser().getName() : "Unknown"
                ))
                .collect(Collectors.toList()));
        
        response.put("status", "SUCCESS");
        response.put("timestamp", LocalDateTime.now().toString());
        
    } catch (Exception e) {
        response.put("status", "ERROR");
        response.put("error", e.getMessage());
        response.put("timestamp", LocalDateTime.now().toString());
    }
    
    return response;
}
    @GetMapping("/provider/{providerId}")
    public ResponseEntity<?> getProviderReviews(@PathVariable String providerId) {
        try {
            System.out.println("=== GETTING REVIEWS FOR PROVIDER: " + providerId + " ===");
            
            List<ReviewResponse> reviews = reviewService.getProviderReviews(providerId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("providerId", providerId);
            response.put("reviews", reviews);
            response.put("totalReviews", reviews.size());
            response.put("status", "SUCCESS");
            response.put("timestamp", LocalDateTime.now().toString());
            
            System.out.println("✅ Found " + reviews.size() + " reviews for provider " + providerId);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.out.println("❌ Error getting provider reviews: " + e.getMessage());
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            errorResponse.put("timestamp", LocalDateTime.now().toString());
            errorResponse.put("status", "ERROR");
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @GetMapping("/can-review/{bookingId}")
    public ResponseEntity<?> canUserReviewBooking(@PathVariable String bookingId) {
        try {
            String userId = getCurrentUserId();
            boolean canReview = reviewService.canUserReviewBooking(userId, bookingId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("canReview", canReview);
            response.put("bookingId", bookingId);
            response.put("userId", userId);
            response.put("status", "SUCCESS");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            errorResponse.put("status", "ERROR");
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @GetMapping("/auth-test")
    public ResponseEntity<?> testAuthentication() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            
            Map<String, Object> response = new HashMap<>();
            response.put("authenticated", authentication != null && authentication.isAuthenticated());
            
            if (authentication != null) {
                response.put("principal", authentication.getPrincipal().toString());
                response.put("authorities", authentication.getAuthorities().toString());
                response.put("name", authentication.getName());
                
                // Try to get user ID
                try {
                    String userId = getCurrentUserId();
                    response.put("userId", userId);
                } catch (Exception e) {
                    response.put("userId", "Not available");
                }
            }
            
            response.put("timestamp", LocalDateTime.now().toString());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.out.println("Authentication test error: " + e.getMessage());
            return ResponseEntity.badRequest().body(createErrorResponse("Error: " + e.getMessage()));
        }
    }

    private Map<String, Object> createErrorResponse(String message) {
        Map<String, Object> response = new HashMap<>();
        response.put("error", message);
        response.put("timestamp", LocalDateTime.now().toString());
        response.put("status", "ERROR");
        return response;
    }

    public static class MessageResponse {
        private String message;
        public MessageResponse(String message) { this.message = message; }
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
    }
}