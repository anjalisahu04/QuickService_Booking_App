package com.quickServe.backend.Controller;

import com.quickServe.backend.Model.Booking;
import com.quickServe.backend.Model.Payment;
import com.quickServe.backend.Repository.BookingRepository;
import com.quickServe.backend.Repository.PaymentRepository;
import com.quickServe.backend.Service.PaymentService;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "http://localhost:3000")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Value("${razorpay.key.id:your_razorpay_key_id}")
    private String razorpayKeyId;

    @PostMapping("/create-order")
    public ResponseEntity<?> createOrder(@RequestBody Map<String, Object> data) {
        try {
            String bookingId = (String) data.get("bookingId");
            Double amount = Double.parseDouble(data.get("amount").toString());
            
            Optional<Booking> bookingOpt = bookingRepository.findById(bookingId);
            if (bookingOpt.isEmpty()) {
                return ResponseEntity.badRequest().body(createErrorResponse("Booking not found"));
            }

            Booking booking = bookingOpt.get();
            
            Map<String, Object> orderRequest = new HashMap<>();
            orderRequest.put("amount", amount * 100); 
            orderRequest.put("currency", "INR");
            orderRequest.put("receipt", "booking_" + bookingId);
            orderRequest.put("payment_capture", 1);

            JSONObject order = paymentService.createOrder(orderRequest);
            
            Payment payment = new Payment();
            payment.setBooking(booking);
            payment.setAmount(amount);
            payment.setCurrency("INR");
            payment.setRazorpayOrderId(order.getString("id"));
            payment.setStatus(Payment.PaymentStatus.PENDING);
            payment.setCreatedAt(LocalDateTime.now());
            
            paymentRepository.save(payment);

            Map<String, Object> response = new HashMap<>();
            response.put("orderId", order.getString("id"));
            response.put("amount", order.getInt("amount"));
            response.put("currency", order.getString("currency"));
            response.put("key", razorpayKeyId);
            response.put("bookingId", bookingId);
            response.put("status", "SUCCESS");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(createErrorResponse("Failed to create order: " + e.getMessage()));
        }
    }

    @PostMapping("/verify-payment")
    public ResponseEntity<?> verifyPayment(@RequestBody Map<String, Object> data) {
        try {
            String razorpayOrderId = (String) data.get("razorpay_order_id");
            String razorpayPaymentId = (String) data.get("razorpay_payment_id");
            String razorpaySignature = (String) data.get("razorpay_signature");

            boolean isValidSignature = paymentService.verifyPaymentSignature(
                razorpayOrderId, razorpayPaymentId, razorpaySignature);

            if (!isValidSignature) {
                return ResponseEntity.badRequest().body(createErrorResponse("Payment verification failed"));
            }

            Optional<Payment> paymentOpt = paymentRepository.findByRazorpayOrderId(razorpayOrderId);
            if (paymentOpt.isPresent()) {
                Payment payment = paymentOpt.get();
                payment.setRazorpayPaymentId(razorpayPaymentId);
                payment.setRazorpaySignature(razorpaySignature);
                payment.setStatus(Payment.PaymentStatus.COMPLETED);
                payment.setPaidAt(LocalDateTime.now());
                
                paymentRepository.save(payment);

                Booking booking = payment.getBooking();
                
                booking.setIsPaid(true);
                booking.setPaymentDate(LocalDateTime.now());
                booking.setPaymentMethod("Razorpay");
                booking.setTransactionId(razorpayPaymentId);
                
                
                bookingRepository.save(booking);

                Map<String, Object> response = new HashMap<>();
                response.put("status", "SUCCESS");
                response.put("message", "Payment verified successfully");
                response.put("paymentId", payment.getId());
                response.put("bookingId", booking.getId());
                response.put("bookingStatus", booking.getStatus().toString()); // Return current status
                response.put("isPaid", true);

                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.badRequest().body(createErrorResponse("Payment record not found"));
            }

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(createErrorResponse("Payment verification failed: " + e.getMessage()));
        }
    }

    @GetMapping("/booking/{bookingId}")
    public ResponseEntity<?> getPaymentByBooking(@PathVariable String bookingId) {
        try {
            Optional<Payment> paymentOpt = paymentRepository.findByBookingId(bookingId);
            if (paymentOpt.isPresent()) {
                Payment payment = paymentOpt.get();
                
                Map<String, Object> response = new HashMap<>();
                response.put("paymentId", payment.getId());
                response.put("status", payment.getStatus().toString());
                response.put("amount", payment.getAmount());
                response.put("razorpayOrderId", payment.getRazorpayOrderId());
                response.put("razorpayPaymentId", payment.getRazorpayPaymentId());
                response.put("createdAt", payment.getCreatedAt());
                response.put("paidAt", payment.getPaidAt());
                response.put("isPaid", payment.getStatus() == Payment.PaymentStatus.COMPLETED);
                
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.ok(createErrorResponse("No payment found for this booking"));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(createErrorResponse("Error fetching payment: " + e.getMessage()));
        }
    }

    private Map<String, Object> createErrorResponse(String message) {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "ERROR");
        response.put("error", message);
        response.put("timestamp", LocalDateTime.now().toString());
        return response;
    }
}