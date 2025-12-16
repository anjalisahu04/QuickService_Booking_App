package com.quickServe.backend.Controller;

import com.quickServe.backend.Payload.request.AddressRequest;
import com.quickServe.backend.Payload.response.AddressResponse;
import com.quickServe.backend.Security.service.UserDetailsServiceImpl;
import com.quickServe.backend.Service.AddressService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/addresses")
@CrossOrigin(origins = "http://localhost:3000", maxAge = 3600)
public class AddressController {

    @Autowired
    private AddressService addressService;

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

    @GetMapping
    public ResponseEntity<?> getUserAddresses() {
        try {
            String userId = getCurrentUserId();
            List<AddressResponse> addresses = addressService.getUserAddresses(userId);
            return ResponseEntity.ok(addresses);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<?> addAddress(@Valid @RequestBody AddressRequest addressRequest) {
        try {
            String userId = getCurrentUserId();
            AddressResponse address = addressService.addAddress(userId, addressRequest);
            return ResponseEntity.ok(address);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @PutMapping("/{addressId}")
    public ResponseEntity<?> updateAddress(
            @PathVariable String addressId,
            @Valid @RequestBody AddressRequest addressRequest) {
        try {
            String userId = getCurrentUserId();
            AddressResponse address = addressService.updateAddress(userId, addressId, addressRequest);
            return ResponseEntity.ok(address);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @DeleteMapping("/{addressId}")
    public ResponseEntity<?> deleteAddress(@PathVariable String addressId) {
        try {
            String userId = getCurrentUserId();
            addressService.deleteAddress(userId, addressId);
            return ResponseEntity.ok(new MessageResponse("Address deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @PostMapping("/{addressId}/set-default")
    public ResponseEntity<?> setDefaultAddress(@PathVariable String addressId) {
        try {
            String userId = getCurrentUserId();
            AddressResponse address = addressService.setDefaultAddress(userId, addressId);
            return ResponseEntity.ok(address);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    public static class MessageResponse {
        private String message;
        public MessageResponse(String message) { this.message = message; }
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
    }
}