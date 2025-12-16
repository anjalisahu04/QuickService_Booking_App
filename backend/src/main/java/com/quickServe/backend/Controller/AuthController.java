package com.quickServe.backend.Controller;

import com.quickServe.backend.Model.User;
import com.quickServe.backend.Model.Role;
import com.quickServe.backend.Model.Address;
import com.quickServe.backend.Payload.request.LoginRequest;
import com.quickServe.backend.Payload.request.RegisterRequest;
import com.quickServe.backend.Payload.request.ProfileUpdateRequest;
import com.quickServe.backend.Payload.response.AuthResponse;
import com.quickServe.backend.Service.AddressService;
import com.quickServe.backend.Service.AuthService;
import com.quickServe.backend.Repository.UserRepository;
import com.quickServe.backend.Security.service.UserDetailsServiceImpl;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import java.util.Optional;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:3000", maxAge = 3600)
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserDetailsServiceImpl userDetailsService;

    @Autowired
    private AddressService addressService;

    // Auth endpoints
    @PostMapping("/auth/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        try {
            AuthResponse authResponse = authService.loginUser(loginRequest);
            return ResponseEntity.ok(authResponse);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @PostMapping("/auth/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody RegisterRequest registerRequest) {
        try {
            String message = authService.registerUser(registerRequest);
            return ResponseEntity.ok(new MessageResponse(message));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    // User profile endpoints
    @GetMapping("/users/profile")

    public ResponseEntity<?> getCurrentUserProfile() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String email = authentication.getName();

            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            return ResponseEntity.ok(new AuthResponse.UserDetails(
                    user.getId(),
                    user.getName(),
                    user.getEmail(),
                    user.getPhone(),
                    user.getRole(),
                    user.getServiceType(),
                    user.getServiceCharge(),
                    user.getExperience(),
                    user.getRating(),
                    user.getTotalRatings()));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    // Update user profile
    @PutMapping("/users/profile")

    public ResponseEntity<?> updateUserProfile(@RequestBody ProfileUpdateRequest updateRequest) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String email = authentication.getName();

            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));


            if (updateRequest.getName() != null) {
                user.setName(updateRequest.getName().trim());
            }
            if (updateRequest.getPhone() != null) {
                user.setPhone(updateRequest.getPhone().trim());
            }


            if (user.getRole() == com.quickServe.backend.Model.Role.PROVIDER) {
                if (updateRequest.getServiceType() != null) {
                    user.setServiceType(updateRequest.getServiceType().trim());
                }
                if (updateRequest.getServiceCharge() != null) {
                    user.setServiceCharge(updateRequest.getServiceCharge());
                }
                if (updateRequest.getExperience() != null) {
                    user.setExperience(updateRequest.getExperience());
                }
            }

            userRepository.save(user);

            return ResponseEntity.ok(new MessageResponse("Profile updated successfully!"));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: " + e.getMessage()));
        }
    }


    @GetMapping("/users/{userId}")
    public ResponseEntity<?> getUserById(@PathVariable String userId) {
        try {
            Optional<User> userOptional = userRepository.findById(userId);
            if (userOptional.isPresent()) {
                User user = userOptional.get();

                // Return public profile data (exclude sensitive info)
                AuthResponse.UserDetails userDetails = new AuthResponse.UserDetails(
                        user.getId(),
                        user.getName(),
                        null,
                        null, 
                        user.getRole(),
                        user.getServiceType(),
                        user.getServiceCharge(),
                        user.getExperience(),
                        user.getRating(),
                        user.getTotalRatings());

                return ResponseEntity.ok(userDetails);
            } else {
                return ResponseEntity.badRequest().body(new MessageResponse("User not found"));
            }

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    // Get all service providers (public endpoint)
    @GetMapping("/providers")
    public ResponseEntity<?> getAllServiceProviders() {
        try {
            List<User> providers = userRepository.findByRole(com.quickServe.backend.Model.Role.PROVIDER);
            System.out.println("Found " + providers.size() + " providers in database");

            for (User provider : providers) {
                System.out.println("Provider from DB - ID: " + provider.getId() +
                        ", Name: " + provider.getName() +
                        ", ServiceType: " + provider.getServiceType() +
                        ", ServiceCharge: " + provider.getServiceCharge());
            }
            List<AuthResponse.UserDetails> providerDetails = providers.stream()
                    .map(provider -> new AuthResponse.UserDetails(
                            provider.getId(),
                            provider.getName(),
                            null, 
                            null, 
                            provider.getRole(),
                            provider.getServiceType(),
                            provider.getServiceCharge(),
                            provider.getExperience(),
                            provider.getRating(),
                            provider.getTotalRatings()))
                    .collect(Collectors.toList());

            return ResponseEntity.ok(providerDetails);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: " + e.getMessage()));
        }
    }
    
    @GetMapping("/providers-with-addresses")
    public ResponseEntity<?> getAllServiceProvidersWithAddresses() {
        try {
            List<User> providers = userRepository.findByRole(Role.PROVIDER);

            List<ProviderWithAddressesResponse> providerResponses = providers.stream()
                    .map(provider -> {
                        
                        List<Address> addresses = addressService.getAddressesByUserId(provider.getId());

                       
                        List<String> cities = addresses.stream()
                                .map(Address::getCity)
                                .filter(city -> city != null && !city.trim().isEmpty())
                                .distinct()
                                .collect(Collectors.toList());

                        return new ProviderWithAddressesResponse(
                                provider.getId(),
                                provider.getName(),
                                provider.getRole(),
                                provider.getServiceType(),
                                provider.getServiceCharge(),
                                provider.getExperience(),
                                provider.getRating(),
                                provider.getTotalRatings(),
                                cities
                        );
                    })
                    .collect(Collectors.toList());

            return ResponseEntity.ok(providerResponses);

        } catch (Exception e) {
            System.out.println("Error in getAllServiceProvidersWithAddresses: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(new MessageResponse("Error: " + e.getMessage()));
        }
    }
@GetMapping("/providers/{providerId}/details")
public ResponseEntity<?> getProviderDetails(@PathVariable String providerId) {
    try {
        Optional<User> userOptional = userRepository.findById(providerId);
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            
            if (user.getRole() != Role.PROVIDER) {
                return ResponseEntity.badRequest().body(new MessageResponse("User is not a service provider"));
            }

            // Get provider details
            AuthResponse.UserDetails userDetails = new AuthResponse.UserDetails(
                    user.getId(),
                    user.getName(),
                    null, 
                    user.getPhone(), 
                    user.getRole(),
                    user.getServiceType(),
                    user.getServiceCharge(),
                    user.getExperience(),
                    user.getRating(),
                    user.getTotalRatings());

            return ResponseEntity.ok(userDetails);
        } else {
            return ResponseEntity.badRequest().body(new MessageResponse("Provider not found"));
        }

    } catch (Exception e) {
        return ResponseEntity.badRequest().body(new MessageResponse("Error: " + e.getMessage()));
    }
}
    // Update the response DTO to send only cities
    public static class ProviderWithAddressesResponse {
        private String id;
        private String name;
        private Role role;
        private String serviceType;
        private Double serviceCharge;
        private Integer experience;
        private Double rating;
        private Integer totalRatings;
        private List<String> cities; 

        public ProviderWithAddressesResponse(String id, String name, Role role, String serviceType,
                Double serviceCharge, Integer experience, Double rating,
                Integer totalRatings, List<String> cities) {
            this.id = id;
            this.name = name;
            this.role = role;
            this.serviceType = serviceType;
            this.serviceCharge = serviceCharge;
            this.experience = experience;
            this.rating = rating;
            this.totalRatings = totalRatings;
            this.cities = cities;
        }

        // Getters and setters
        public String getId() {
            return id;
        }

        public void setId(String id) {
            this.id = id;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public Role getRole() {
            return role;
        }

        public void setRole(Role role) {
            this.role = role;
        }

        public String getServiceType() {
            return serviceType;
        }

        public void setServiceType(String serviceType) {
            this.serviceType = serviceType;
        }

        public Double getServiceCharge() {
            return serviceCharge;
        }

        public void setServiceCharge(Double serviceCharge) {
            this.serviceCharge = serviceCharge;
        }

        public Integer getExperience() {
            return experience;
        }

        public void setExperience(Integer experience) {
            this.experience = experience;
        }

        public Double getRating() {
            return rating;
        }

        public void setRating(Double rating) {
            this.rating = rating;
        }

        public Integer getTotalRatings() {
            return totalRatings;
        }

        public void setTotalRatings(Integer totalRatings) {
            this.totalRatings = totalRatings;
        }

        public List<String> getCities() {
            return cities;
        }

        public void setCities(List<String> cities) {
            this.cities = cities;
        }
    }

    // Add this static class for message responses
    public static class MessageResponse {
        private String message;

        public MessageResponse(String message) {
            this.message = message;
        }

        public String getMessage() {
            return message;
        }

        public void setMessage(String message) {
            this.message = message;
        }
    }
}