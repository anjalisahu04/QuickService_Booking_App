package com.quickServe.backend.Repository;

import com.quickServe.backend.Model.Payment;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PaymentRepository extends MongoRepository<Payment, String> {
    Optional<Payment> findByRazorpayOrderId(String razorpayOrderId);
    Optional<Payment> findByBookingId(String bookingId);
    Optional<Payment> findByRazorpayPaymentId(String razorpayPaymentId);
}