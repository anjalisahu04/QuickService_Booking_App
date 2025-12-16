package com.quickServe.backend.Payload.response;

import java.time.LocalDateTime;

public class ReviewResponse {
    private String id;
    private String userName;
    private Integer rating;
    private String comment;
    private LocalDateTime createdAt;
    private String bookingId;
    private String serviceType;

    // Constructors
    public ReviewResponse() {}

    public ReviewResponse(String id, String userName, Integer rating, String comment, 
                         LocalDateTime createdAt, String bookingId, String serviceType) {
        this.id = id;
        this.userName = userName;
        this.rating = rating;
        this.comment = comment;
        this.createdAt = createdAt;
        this.bookingId = bookingId;
        this.serviceType = serviceType;
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }

    public Integer getRating() { return rating; }
    public void setRating(Integer rating) { this.rating = rating; }

    public String getComment() { return comment; }
    public void setComment(String comment) { this.comment = comment; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public String getBookingId() { return bookingId; }
    public void setBookingId(String bookingId) { this.bookingId = bookingId; }

    public String getServiceType() { return serviceType; }
    public void setServiceType(String serviceType) { this.serviceType = serviceType; }
}