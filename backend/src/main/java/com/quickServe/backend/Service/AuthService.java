 package com.quickServe.backend.Service;

import com.quickServe.backend.Model.Role;
import com.quickServe.backend.Model.User;
import com.quickServe.backend.Model.VerificationStatus;
import com.quickServe.backend.Payload.request.LoginRequest;
import com.quickServe.backend.Payload.request.RegisterRequest;
import com.quickServe.backend.Payload.response.AuthResponse;
import com.quickServe.backend.Repository.UserRepository;
import com.quickServe.backend.Security.jwt.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    public AuthResponse loginUser(LoginRequest loginRequest) {
        try {
            String email = loginRequest.getEmail().trim().toLowerCase();
            String password = loginRequest.getPassword();
            
            // First check if user exists
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Error: User not found."));
            
            System.out.println("Attempting login for: " + email);
            System.out.println("Stored encoded password: " + user.getPassword());
if (user.getRole() == Role.PROVIDER) {
                if (user.getVerificationStatus() == VerificationStatus.PENDING) {
                    throw new RuntimeException("Your verification is pending. Please wait for admin approval.");
                } else if (user.getVerificationStatus() == VerificationStatus.REJECTED) {
                    throw new RuntimeException("Your verification has been rejected. Reason: " + 
                            (user.getRejectionReason() != null ? user.getRejectionReason() : "Contact admin for details."));
                }
                // If status is VERIFIED, we do nothing and proceed to login.
            }            
            // Authenticate using Spring Security
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(email, password));
            
            SecurityContextHolder.getContext().setAuthentication(authentication);

            // Generate JWT token
            String jwt = jwtUtil.generateToken(authentication);
            return new AuthResponse(jwt, user);

        } catch (BadCredentialsException e) {
            System.out.println("Bad credentials for: " + loginRequest.getEmail());
            throw new RuntimeException("Error: Invalid email or password.");
        } catch (Exception e) {
            System.out.println("Login error: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Error: Login failed - " + e.getMessage());
        }
    }

    public String registerUser(RegisterRequest registerRequest) {
        String email = registerRequest.getEmail().trim().toLowerCase();
        
        // Validate email uniqueness
        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("Error: Email is already in use!");
        }
        
        // Validate password length
        if (registerRequest.getPassword().length() < 6) {
            throw new RuntimeException("Error: Password must be at least 6 characters long.");
        }
        
        // Parse role
        Role userRole;
        try {
            userRole = Role.valueOf(registerRequest.getRole().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Error: Invalid role specified.");
        }
        
        // Handle service type based on role
        String serviceType = null;
        if (userRole == Role.PROVIDER) {
            if (registerRequest.getServiceType() == null || registerRequest.getServiceType().trim().isEmpty()) {
                throw new RuntimeException("Error: Service type is required for providers.");
            }
            serviceType = registerRequest.getServiceType().trim();
        }
        
        // Create and save user
        User user = new User(
                registerRequest.getName().trim(),
                email,
                passwordEncoder.encode(registerRequest.getPassword()),
                registerRequest.getPhone().trim(),
                userRole,
                serviceType,
                null,
                null,
                0.0,
                0
        );
        
        userRepository.save(user);
        return "User registered successfully!";
        // String message = "User registered successfully!";
        // if (userRole == Role.PROVIDER) {
        //     message += " Your account is pending verification. You will be able to login once approved by admin.";
        // }
        
        // return message;
    }
}