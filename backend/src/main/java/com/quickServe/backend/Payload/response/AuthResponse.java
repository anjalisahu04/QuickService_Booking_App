package com.quickServe.backend.Payload.response;

import com.quickServe.backend.Model.Role;


public class AuthResponse {
    private String token;
    private String type = "Bearer";
    private UserDetails user;

    public AuthResponse(String token, com.quickServe.backend.Model.User userModel) {
        this.token = token;
        this.user = new UserDetails(
            userModel.getId(),
            userModel.getName(),
            userModel.getEmail(),
            userModel.getPhone(),
            userModel.getRole(),
            userModel.getServiceType(),
            userModel.getServiceCharge(),
            userModel.getExperience(),
            userModel.getRating(),
            userModel.getTotalRatings()        );
    }

    // Getters and Setters
    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public UserDetails getUser() { return user; }
    public void setUser(UserDetails user) { this.user = user; }

    // Inner class to structure the user data
    public static class UserDetails {
        private String id;
        private String name;
        private String email;
        private String phone;
        private Role role;
        private String serviceType;
        private Double serviceCharge;
        private Integer experience;
        private Double rating;
        private Integer totalRatings;

        public UserDetails(String id, String name, String email, String phone, Role role, String serviceType,Double serviceCharge, Integer experience, 
                          Double rating, Integer totalRatings) {
            this.id = id;
            this.name = name;
            this.email = email;
            this.phone = phone;
            this.role = role;
            this.serviceType = serviceType;
             this.serviceCharge = serviceCharge;
            this.experience = experience;
            this.rating = rating;
            this.totalRatings = totalRatings;
        }

        // Getters for this inner class
        public String getId() { return id; }
        public String getName() { return name; }
        public String getEmail() { return email; }
        public String getPhone() { return phone; }
        public Role getRole() { return role; }
        public String getServiceType() { return serviceType; }
         public Double getServiceCharge() { return serviceCharge; }
        public Integer getExperience() { return experience; }
        public Double getRating() { return rating; }
        public Integer getTotalRatings() { return totalRatings; }
    }
}
