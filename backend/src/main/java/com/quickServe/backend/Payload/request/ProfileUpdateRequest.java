package com.quickServe.backend.Payload.request;

public class ProfileUpdateRequest {
    private String name;
    private String phone;
    private String serviceType;
    private Double serviceCharge;
    private Integer experience;

    // Getters and Setters
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getServiceType() { return serviceType; }
    public void setServiceType(String serviceType) { this.serviceType = serviceType; }

    public Double getServiceCharge() { return serviceCharge; }
    public void setServiceCharge(Double serviceCharge) { this.serviceCharge = serviceCharge; }

    public Integer getExperience() { return experience; }
    public void setExperience(Integer experience) { this.experience = experience; }
}