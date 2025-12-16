
package com.quickServe.backend.Payload.response;

import com.quickServe.backend.Model.Role;

public class ProviderResponse {
    private String id;
    private String name;
    private Role role;
    private String serviceType;
    private Double serviceCharge;
    private Integer experience;
    private Double rating;
    private Integer totalRatings;

    // Constructor
    public ProviderResponse(String id, String name, Role role, String serviceType, 
                          Double serviceCharge, Integer experience, Double rating, 
                          Integer totalRatings) {
        this.id = id;
        this.name = name;
        this.role = role;
        this.serviceType = serviceType;
        this.serviceCharge = serviceCharge;
        this.experience = experience;
        this.rating = rating;
        this.totalRatings = totalRatings;
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }
    
    public String getServiceType() { return serviceType; }
    public void setServiceType(String serviceType) { this.serviceType = serviceType; }
    
    public Double getServiceCharge() { return serviceCharge; }
    public void setServiceCharge(Double serviceCharge) { this.serviceCharge = serviceCharge; }
    
    public Integer getExperience() { return experience; }
    public void setExperience(Integer experience) { this.experience = experience; }
    
    public Double getRating() { return rating; }
    public void setRating(Double rating) { this.rating = rating; }
    
    public Integer getTotalRatings() { return totalRatings; }
    public void setTotalRatings(Integer totalRatings) { this.totalRatings = totalRatings; }
}