package com.quickServe.backend.Model;

import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

@Document(collection = "users")
@Data
@NoArgsConstructor
public class User {

    @Id
    private String id;

    @NotBlank
    @Size(max = 50)
    private String name;

    @NotBlank
    @Size(max = 100)
    @Email
    @Indexed(unique = true)
    private String email;

    @NotBlank
    @Size(max = 120)
    private String password;

    @NotBlank
    private String phone;

    @NotNull
    private Role role;

    private String serviceType;
    private Double serviceCharge; // Hourly/daily rate
    
    @Min(0)
    private Integer experience; // Years of experience
    
    private Double rating; // Average rating (0-5)
    
    private Integer totalRatings; // To
    private VerificationStatus verificationStatus;
    private String rejectionReason; 

    // Fixed constructor - properly closed
    public User(String name, String email, String password, String phone, Role role, String serviceType) {
        this.name = name;
        this.email = email;
        this.password = password;
        this.phone = phone;
        this.role = role;
        // Only set serviceType if the role is PROVIDER
        if (role == Role.PROVIDER) {
            this.serviceType = serviceType;
            this.serviceCharge = 0.0;
            this.experience = 0;
            this.rating = 0.0;
            this.totalRatings = 0;
            this.verificationStatus = VerificationStatus.PENDING;
        } else {
            this.serviceType = null;
            this.serviceCharge = null;
            this.experience = null;
            this.rating = null;
            this.totalRatings = null;
            this.verificationStatus = VerificationStatus.VERIFIED;
        }
        this.rejectionReason = null;
    }
    public User(String name, String email, String password, String phone, Role role, 
                String serviceType, Double serviceCharge, Integer experience, 
                Double rating, Integer totalRatings) {
        this.name = name;
        this.email = email;
        this.password = password;
        this.phone = phone;
        this.role = role;
        
        if (role == Role.PROVIDER) {
            this.serviceType = serviceType;
            this.serviceCharge = serviceCharge != null ? serviceCharge : 0.0;
            this.experience = experience != null ? experience : 0;
            this.rating = rating != null ? rating : 0.0;
            this.totalRatings = totalRatings != null ? totalRatings : 0;
            this.verificationStatus = VerificationStatus.PENDING;
        } else {
            this.serviceType = null;
            this.serviceCharge = null;
            this.experience = null;
            this.rating = null;
            this.totalRatings = null;
            this.verificationStatus = VerificationStatus.VERIFIED;
        }
        this.rejectionReason = null;
    }
}
