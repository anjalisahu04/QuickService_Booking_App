package com.quickServe.backend.Controller;

import com.quickServe.backend.Model.Role;
import com.quickServe.backend.Model.User;
import com.quickServe.backend.Model.VerificationStatus;
import com.quickServe.backend.Repository.UserRepository;
import com.quickServe.backend.Payload.response.AuthResponse; // Re-use this
import com.quickServe.backend.Controller.AuthController.MessageResponse; // Re-use this
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:3000", maxAge = 3600)
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    @Autowired
    private UserRepository userRepository;


    @GetMapping("/stats")
    public ResponseEntity<?> getDashboardStats() {
        long totalUsers = userRepository.countByRole(Role.USER);
        long totalProviders = userRepository.countByRole(Role.PROVIDER);
        long totalAdmins = userRepository.countByRole(Role.ADMIN);

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", totalUsers);
        stats.put("totalProviders", totalProviders);
        stats.put("totalAdmins", totalAdmins);
        stats.put("totalBookings", 0); // Placeholder
        stats.put("revenue", 0.0);     // Placeholder

        return ResponseEntity.ok(stats);
    }
    @GetMapping("/pending-providers")
    public ResponseEntity<?> getPendingProviders() {
        List<User> pendingProviders = userRepository.findByRole(Role.PROVIDER)
            .stream()
            .filter(user -> user.getVerificationStatus() == VerificationStatus.PENDING)
            .collect(Collectors.toList());
            
        // Use the same UserDetails DTO from AuthResponse
        List<AuthResponse.UserDetails> providerDetails = pendingProviders.stream()
            .map(user -> new AuthResponse.UserDetails(
                user.getId(),
                user.getName(),
                user.getEmail(), 
                user.getPhone(), 
                user.getRole(),
                user.getServiceType(),
                user.getServiceCharge(),
                user.getExperience(),
                user.getRating(),
                user.getTotalRatings()
            ))
            .collect(Collectors.toList());

        return ResponseEntity.ok(providerDetails);
    }

    // 2. Endpoint to APPROVE a provider
    @PostMapping("/verify-provider/{providerId}")
    public ResponseEntity<?> verifyProvider(@PathVariable String providerId) {
        User user = userRepository.findById(providerId)
            .orElseThrow(() -> new RuntimeException("Provider not found"));

        if (user.getRole() != Role.PROVIDER) {
            return ResponseEntity.badRequest().body(new MessageResponse("User is not a provider."));
        }

        user.setVerificationStatus(VerificationStatus.VERIFIED);
        user.setRejectionReason(null); // Clear any previous rejection
        userRepository.save(user);

        return ResponseEntity.ok(new MessageResponse("Provider verified successfully."));
    }

    // 3. Endpoint to REJECT a provider
    @PostMapping("/reject-provider/{providerId}")
    public ResponseEntity<?> rejectProvider(@PathVariable String providerId, @RequestBody Map<String, String> payload) {
        User user = userRepository.findById(providerId)
            .orElseThrow(() -> new RuntimeException("Provider not found"));
        
        String reason = payload.get("reason");
        if (reason == null || reason.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(new MessageResponse("A rejection reason is required."));
        }

        if (user.getRole() != Role.PROVIDER) {
            return ResponseEntity.badRequest().body(new MessageResponse("User is not a provider."));
        }

        user.setVerificationStatus(VerificationStatus.REJECTED);
        user.setRejectionReason(reason.trim());
        userRepository.save(user);

        return ResponseEntity.ok(new MessageResponse("Provider rejected successfully."));
    }
}