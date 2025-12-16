package com.quickServe.backend.Controller;

import com.quickServe.backend.Model.Booking;
import com.quickServe.backend.Payload.request.BookingRequest;
import com.quickServe.backend.Payload.response.BookingResponse;
import com.quickServe.backend.Security.service.UserDetailsServiceImpl;
import com.quickServe.backend.Service.BookingService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
// @CrossOrigin(origins = "http://localhost:3000", maxAge = 3600)
public class BookingController {

    @Autowired
    private BookingService bookingService;

    @Autowired
    private UserDetailsServiceImpl userDetailsService;

    // Helper method to get current user ID from JWT
    private String getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof UserDetails) {
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            return userDetailsService.getUserIdByEmail(userDetails.getUsername());
        }
        throw new RuntimeException("User not authenticated");
    }

    @PostMapping
   
    public ResponseEntity<?> createBooking(@Valid @RequestBody BookingRequest bookingRequest) {
        try {
            String userId = getCurrentUserId();
            System.out.println("--- [CREATE BOOKING] ---");
            System.out.println("Customer ID (from token): " + userId);
            System.out.println("Provider ID (from request): " + bookingRequest.getProviderId());
         
            BookingResponse booking = bookingService.createBooking(userId, bookingRequest);
            return ResponseEntity.ok(booking);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @GetMapping("/user")
    @PreAuthorize("hasAnyRole('USER', 'PROVIDER')") // Allow both
    public ResponseEntity<?> getUserBookings() {
        try {
            String userId = getCurrentUserId();
            List<BookingResponse> bookings = bookingService.getUserBookings(userId);
            return ResponseEntity.ok(bookings);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @GetMapping("/provider")
    public ResponseEntity<?> getProviderBookings() {
        try {
            String providerId = getCurrentUserId();
            System.out.println("--- [GET PROVIDER BOOKINGS] ---");
            System.out.println("Provider ID (from token): " + providerId); 
            List<BookingResponse> bookings = bookingService.getProviderBookings(providerId);
            System.out.println("Bookings found for this ID: " + bookings.size());
            return ResponseEntity.ok(bookings);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @PutMapping("/{bookingId}/status")
    @PreAuthorize("hasAnyRole('PROVIDER', 'USER')")
    public ResponseEntity<?> updateBookingStatus(
            @PathVariable String bookingId,
            @RequestBody Map<String, String> payload) {
        try {
            String providerId = getCurrentUserId();
            String status = payload.get("status");
            if (status == null || status.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(new MessageResponse("Error: Status is required."));
            }
            BookingResponse booking = bookingService.updateBookingStatus(providerId, bookingId, status);
            return ResponseEntity.ok(booking);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }
    @GetMapping("/user-with-reviews")
public ResponseEntity<?> getUserBookingsWithReviewStatus() {
    try {
        String userId = getCurrentUserId();
        List<BookingResponse> bookings = bookingService.getUserBookingsWithReviewStatus(userId);
        return ResponseEntity.ok(bookings);
    } catch (Exception e) {
        return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
    }
}

@GetMapping("/{bookingId}/with-review")
public ResponseEntity<?> getBookingWithReviewStatus(@PathVariable String bookingId) {
    try {
        String userId = getCurrentUserId();
        BookingResponse booking = bookingService.getBookingWithReviewStatus(bookingId, userId);
        return ResponseEntity.ok(booking);
    } catch (Exception e) {
        return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
    }
}
    // Static inner class for error messages
    public static class MessageResponse {
        private String message;
        public MessageResponse(String message) { this.message = message; }
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
    }
}