package com.quickServe.backend.Service;

import com.quickServe.backend.Model.Address;
import com.quickServe.backend.Model.Booking;
import com.quickServe.backend.Model.User;
import com.quickServe.backend.Payload.request.BookingRequest;
import com.quickServe.backend.Payload.response.BookingResponse;
import com.quickServe.backend.Repository.AddressRepository;
import com.quickServe.backend.Repository.BookingRepository;
import com.quickServe.backend.Repository.ReviewRepository;

import com.quickServe.backend.Repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;
import java.util.*;

@Service
public class BookingService {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AddressRepository addressRepository;
    
    @Autowired
    private ReviewRepository reviewRepository;
  

    // Helper method to convert Booking entity to BookingResponse DTO
    private BookingResponse convertToResponse(Booking booking) {
        return new BookingResponse(booking);
    }

    public BookingResponse createBooking(String userId, BookingRequest bookingRequest) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Error: User not found."));

        User provider = userRepository.findById(bookingRequest.getProviderId())
                .orElseThrow(() -> new RuntimeException("Error: Provider not found."));

        Address address = addressRepository.findById(bookingRequest.getAddressId())
                .orElseThrow(() -> new RuntimeException("Error: Address not found."));

        // Check if the address belongs to the user
        if (!address.getUser().getId().equals(userId)) {
            throw new RuntimeException("Error: Address does not belong to the current user.");
        }

        // Calculate total amount (if not provided)
        Double totalAmount = bookingRequest.getTotalAmount();
        if (totalAmount == null && provider.getServiceCharge() != null) {
            totalAmount = provider.getServiceCharge();
        }

        Booking booking = new Booking(
                user,
                provider,
                address,
                bookingRequest.getServiceType(),
                bookingRequest.getDescription(),
                bookingRequest.getBookingDate(),
                bookingRequest.getBookingTime(),
                totalAmount,
                bookingRequest.getUserNotes()
        );

        Booking savedBooking = bookingRepository.save(booking);
        return convertToResponse(savedBooking);
    }

    public List<BookingResponse> getUserBookings(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Error: User not found."));

        return bookingRepository.findByUser(user).stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    public List<BookingResponse> getProviderBookings(String providerId) {
        User provider = userRepository.findById(providerId)
                .orElseThrow(() -> new RuntimeException("Error: Provider not found."));

        return bookingRepository.findByProvider(provider).stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    public List<BookingResponse> getProviderBookingsByStatus(String providerId, Booking.BookingStatus status) {
        User provider = userRepository.findById(providerId)
                .orElseThrow(() -> new RuntimeException("Error: Provider not found."));

        return bookingRepository.findByProviderAndStatus(provider, status).stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    public BookingResponse updateBookingStatus(String providerId, String bookingId, String status) {
        User provider = userRepository.findById(providerId)
                .orElseThrow(() -> new RuntimeException("Error: Provider not found."));

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Error: Booking not found."));

        // Security check: Ensure the provider updating the booking is the one assigned
        if (!booking.getProvider().getId().equals(provider.getId())) {
            throw new RuntimeException("Error: You are not authorized to update this booking.");
        }

        // Validate status
        try {
            Booking.BookingStatus newStatus = Booking.BookingStatus.valueOf(status.toUpperCase());
            
            // Validate status transitions
            if (booking.getStatus() == Booking.BookingStatus.COMPLETED || 
                booking.getStatus() == Booking.BookingStatus.CANCELLED ||
                booking.getStatus() == Booking.BookingStatus.REJECTED) {
                throw new RuntimeException("Error: Cannot update a completed, cancelled, or rejected booking.");
            }
            
            booking.setStatus(newStatus);
            booking.setUpdatedAt(LocalDate.now());
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Error: Invalid status value. Allowed values: PENDING, CONFIRMED, IN_PROGRESS, COMPLETED, CANCELLED, REJECTED");
        }

        Booking updatedBooking = bookingRepository.save(booking);
        return convertToResponse(updatedBooking);
    }

    public BookingResponse getBookingById(String bookingId, String userId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Error: Booking not found."));

        // Security check: User can only access their own bookings
        if (!booking.getUser().getId().equals(userId)) {
            throw new RuntimeException("Error: You are not authorized to access this booking.");
        }

        return convertToResponse(booking);
    }
    public BookingResponse getBookingWithReviewStatus(String bookingId, String userId) {
    Booking booking = bookingRepository.findById(bookingId)
            .orElseThrow(() -> new RuntimeException("Error: Booking not found."));

    // Security check: User can only access their own bookings
    if (!booking.getUser().getId().equals(userId)) {
        throw new RuntimeException("Error: You are not authorized to access this booking.");
    }

    BookingResponse response = convertToResponse(booking);
    
    // Check if review exists for this booking
    boolean hasReviewed = reviewRepository.existsByBookingId(bookingId);
    response.setHasReviewed(hasReviewed);
    
    return response;
   }
   public List<BookingResponse> getUserBookingsWithReviewStatus(String userId) {
    User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("Error: User not found."));

    List<Booking> bookings = bookingRepository.findByUser(user);
    
    return bookings.stream()
            .map(booking -> {
                BookingResponse response = convertToResponse(booking);
                boolean hasReviewed = reviewRepository.existsByBookingId(booking.getId());
                response.setHasReviewed(hasReviewed);
                return response;
            })
            .collect(Collectors.toList());
}
}