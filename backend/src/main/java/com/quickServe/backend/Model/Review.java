package com.quickServe.backend.Model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Document(collection = "reviews")
@Data
public class Review {
    @Id
    private String id;
    
    @DBRef
    private User user;
    
    @DBRef
    private User provider;
    
    @DBRef
    private Booking booking;
    
    private Integer rating;
    private String comment;
    private LocalDateTime createdAt;
    
    // Constructors, getters, setters
    public Review(User user, User provider, Booking booking, Integer rating, String comment) {
        this.user = user;
        this.provider = provider;
        this.booking = booking;
        this.rating = rating;
        this.comment = comment;
        this.createdAt = LocalDateTime.now();
    }
}