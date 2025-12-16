package com.quickServe.backend.Payload.response;

import com.quickServe.backend.Model.Booking;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

public class BookingResponse {
    private String id;
    
    // User (Customer) Details
    private String userId;
    private String userName;
    private String userEmail;
    private String userPhone;

    // Provider Details
    private String providerId;
    private String providerName;
    private String providerEmail;
    private String providerPhone;

    // Booking Details
    private String serviceType;
    private String description;
    private LocalDate bookingDate;
    private LocalTime bookingTime;
    private Double totalAmount;
    private Booking.BookingStatus status;
    private String userNotes;
    private AddressResponse address;
    private LocalDate createdAt;
    private Boolean hasReviewed;

    private Boolean isPaid;
    private LocalDateTime paymentDate;
    private String paymentMethod;

    // Constructor from Booking entity
    public BookingResponse(Booking booking) {
        this.id = booking.getId();
        this.hasReviewed = false;
        this.isPaid = booking.getIsPaid();
        this.paymentDate = booking.getPaymentDate();
        this.paymentMethod = booking.getPaymentMethod();
        
        // Populate User details
        if (booking.getUser() != null) {
            this.userId = booking.getUser().getId();
            this.userName = booking.getUser().getName();
            this.userEmail = booking.getUser().getEmail();
            this.userPhone = booking.getUser().getPhone();
        }

        // Populate Provider details
        if (booking.getProvider() != null) {
            this.providerId = booking.getProvider().getId();
            this.providerName = booking.getProvider().getName();
            this.providerEmail = booking.getProvider().getEmail();
            this.providerPhone = booking.getProvider().getPhone();
        }

        this.serviceType = booking.getServiceType();
        this.description = booking.getDescription();
        this.bookingDate = booking.getBookingDate();
        this.bookingTime = booking.getBookingTime();
        this.totalAmount = booking.getTotalAmount();
        this.status = booking.getStatus();
        this.userNotes = booking.getUserNotes();
        this.createdAt = booking.getCreatedAt();
        
        // Convert Address to AddressResponse
        if (booking.getAddress() != null) {
            this.address = new AddressResponse(
                    booking.getAddress().getId(),
                    booking.getAddress().getName(),
                    booking.getAddress().getAddress(),
                    booking.getAddress().getCity(),
                    booking.getAddress().getState(),
                    booking.getAddress().getPincode(),
                    booking.getAddress().isDefault()
            );
        }
    }


    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }
    public String getUserEmail() { return userEmail; }
    public void setUserEmail(String userEmail) { this.userEmail = userEmail; }
    public String getUserPhone() { return userPhone; }
    public void setUserPhone(String userPhone) { this.userPhone = userPhone; }
    public String getProviderId() { return providerId; }
    public void setProviderId(String providerId) { this.providerId = providerId; }
    public String getProviderName() { return providerName; }
    public void setProviderName(String providerName) { this.providerName = providerName; }
    public String getProviderEmail() { return providerEmail; }
    public void setProviderEmail(String providerEmail) { this.providerEmail = providerEmail; }
    public String getProviderPhone() { return providerPhone; }
    public void setProviderPhone(String providerPhone) { this.providerPhone = providerPhone; }
    public String getServiceType() { return serviceType; }
    public void setServiceType(String serviceType) { this.serviceType = serviceType; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public LocalDate getBookingDate() { return bookingDate; }
    public void setBookingDate(LocalDate bookingDate) { this.bookingDate = bookingDate; }
    public LocalTime getBookingTime() { return bookingTime; }
    public void setBookingTime(LocalTime bookingTime) { this.bookingTime = bookingTime; }
    public Double getTotalAmount() { return totalAmount; }
    public void setTotalAmount(Double totalAmount) { this.totalAmount = totalAmount; }
    public Booking.BookingStatus getStatus() { return status; }
    public void setStatus(Booking.BookingStatus status) { this.status = status; }
    public String getUserNotes() { return userNotes; }
    public void setUserNotes(String userNotes) { this.userNotes = userNotes; }
    public AddressResponse getAddress() { return address; }
    public void setAddress(AddressResponse address) { this.address = address; }
    public LocalDate getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDate createdAt) { this.createdAt = createdAt; }
    public Boolean getHasReviewed() { return hasReviewed; }
    public void setHasReviewed(Boolean hasReviewed) { this.hasReviewed = hasReviewed; }
}