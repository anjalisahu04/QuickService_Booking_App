package com.quickServe.backend.Model;

import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Document(collection = "bookings")
@Data
@NoArgsConstructor
public class Booking {
    
    @Id
    private String id;

    @DBRef
    private User user;

    @DBRef
    private User provider;

    @DBRef
    private Address address;

    private String serviceType;
    private String description;
    private LocalDate bookingDate;
    private LocalTime bookingTime;
    private Double totalAmount;
    private BookingStatus status;
    private String userNotes;

    private LocalDate createdAt;
    private LocalDate updatedAt;
     private Boolean isPaid = false;
    private LocalDateTime paymentDate;
    private String paymentMethod;
    private String transactionId;
    public enum BookingStatus {
        PENDING,
        CONFIRMED,
        IN_PROGRESS,
        COMPLETED,
        CANCELLED,
        REJECTED
    }

    public Booking(User user, User provider, Address address, String serviceType, 
                  String description, LocalDate bookingDate, LocalTime bookingTime, 
                  Double totalAmount, String userNotes) {
        this.user = user;
        this.provider = provider;
        this.address = address;
        this.serviceType = serviceType;
        this.description = description;
        this.bookingDate = bookingDate;
        this.bookingTime = bookingTime;
        this.totalAmount = totalAmount;
        this.userNotes = userNotes;
        this.status = BookingStatus.PENDING;
        this.createdAt = LocalDate.now();
        this.updatedAt = LocalDate.now();
    }
}