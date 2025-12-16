package com.quickServe.backend.Payload.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class ReviewRequest {
    
    @NotNull
    private String bookingId;
    
    @NotNull
    private String providerId;
    
    @NotNull
    @Min(1)
    @Max(5)
    private Integer rating;
    
    @NotBlank
    @Size(min = 10, max = 500, message = "Comment must be between 10 and 500 characters")
    private String comment;

    // Getters and Setters
    public String getBookingId() { return bookingId; }
    public void setBookingId(String bookingId) { this.bookingId = bookingId; }

    public String getProviderId() { return providerId; }
    public void setProviderId(String providerId) { this.providerId = providerId; }

    public Integer getRating() { return rating; }
    public void setRating(Integer rating) { this.rating = rating; }

    public String getComment() { return comment; }
    public void setComment(String comment) { this.comment = comment; }
}