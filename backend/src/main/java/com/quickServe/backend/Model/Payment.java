package com.quickServe.backend.Model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "payments")
@Data
public class Payment {
    @Id
    private String id;

    @DBRef
    private Booking booking;

    private Double amount;
    private String currency;
    private PaymentStatus status;

    // Razorpay fields
    private String razorpayOrderId;
    private String razorpayPaymentId;
    private String razorpaySignature;

    private LocalDateTime createdAt;
    private LocalDateTime paidAt;

    public enum PaymentStatus {
        PENDING, COMPLETED, FAILED, REFUNDED
    }

    // Constructors
    public Payment() {
        this.createdAt = LocalDateTime.now();
        this.status = PaymentStatus.PENDING;
    }
}