package com.quickServe.backend.Service;

import com.quickServe.backend.Model.Booking;
import com.quickServe.backend.Model.Review;
import com.quickServe.backend.Model.User;
import com.quickServe.backend.Payload.request.ReviewRequest;
import com.quickServe.backend.Payload.response.ReviewResponse;
import com.quickServe.backend.Repository.BookingRepository;
import com.quickServe.backend.Repository.ReviewRepository;
import com.quickServe.backend.Repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReviewService {

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Transactional
    public Review createReview(String userId, ReviewRequest reviewRequest) {
        System.out.println("=== CREATING REVIEW ===");
        System.out.println("User ID: " + userId);
        System.out.println("Booking ID: " + reviewRequest.getBookingId());
        System.out.println("Provider ID: " + reviewRequest.getProviderId());

        // Validate user exists
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Error: User not found."));

        // Validate provider exists
        User provider = userRepository.findById(reviewRequest.getProviderId())
                .orElseThrow(() -> new RuntimeException("Error: Provider not found."));

        // Validate booking exists and belongs to user
        Booking booking = bookingRepository.findById(reviewRequest.getBookingId())
                .orElseThrow(() -> new RuntimeException("Error: Booking not found."));

        // Check if booking belongs to the user
        if (!booking.getUser().getId().equals(userId)) {
            throw new RuntimeException("Error: You can only review your own bookings.");
        }

        // Check if booking is completed
        if (booking.getStatus() != Booking.BookingStatus.COMPLETED) {
            throw new RuntimeException("Error: You can only review completed bookings.");
        }

        // Check if review already exists for this booking
        if (reviewRepository.existsByBookingId(reviewRequest.getBookingId())) {
            throw new RuntimeException("Error: You have already reviewed this booking.");
        }

        // Create and save review
        Review review = new Review(user, provider, booking, reviewRequest.getRating(), reviewRequest.getComment());
        Review savedReview = reviewRepository.save(review);

        // Update provider's rating statistics
        updateProviderRating(provider.getId());

        System.out.println("✅ Review created successfully with ID: " + savedReview.getId());
        return savedReview;
    }

    public List<ReviewResponse> getProviderReviews(String providerId) {
        System.out.println("=== GETTING REVIEWS FOR PROVIDER: " + providerId + " ===");
        
        User provider = userRepository.findById(providerId)
                .orElseThrow(() -> new RuntimeException("Error: Provider not found."));

        List<Review> reviews;
    try {
        reviews = reviewRepository.findByProviderId(providerId);
        System.out.println("Found " + reviews.size() + " reviews using findByProviderId");
        
        // If no reviews found, try the alternative method
        if (reviews.isEmpty()) {
            reviews = reviewRepository.findByProviderOrderByCreatedAtDesc(provider);
            System.out.println("Found " + reviews.size() + " reviews using findByProviderOrderByCreatedAtDesc");
        }
    } catch (Exception e) {
        System.out.println("Error fetching reviews: " + e.getMessage());
        reviews = new ArrayList<>();
    }

        return reviews.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    public List<ReviewResponse> getUserReviews(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Error: User not found."));

        List<Review> reviews = reviewRepository.findByUserId(userId);

        return reviews.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public void updateProviderRating(String providerId) {
        System.out.println("=== UPDATING PROVIDER RATING FOR: " + providerId + " ===");
        
        List<Review> reviews = reviewRepository.findByProviderId(providerId);
        System.out.println("Total reviews found: " + reviews.size());

        if (reviews.isEmpty()) {
            System.out.println("No reviews found, setting default rating");
            // Set default rating if no reviews
            User provider = userRepository.findById(providerId)
                    .orElseThrow(() -> new RuntimeException("Provider not found"));
            provider.setRating(0.0);
            provider.setTotalRatings(0);
            userRepository.save(provider);
            return;
        }

        double averageRating = reviews.stream()
                .mapToInt(Review::getRating)
                .average()
                .orElse(0.0);

        int totalRatings = reviews.size();

        // Round to 1 decimal place
        double roundedRating = Math.round(averageRating * 10.0) / 10.0;

        User provider = userRepository.findById(providerId)
                .orElseThrow(() -> new RuntimeException("Provider not found"));

        provider.setRating(roundedRating);
        provider.setTotalRatings(totalRatings);

        User savedProvider = userRepository.save(provider);
        
        System.out.println("✅ Provider rating updated - Rating: " + roundedRating + ", Total Reviews: " + totalRatings);
        System.out.println("Saved provider: " + savedProvider.getName() + " - Rating: " + savedProvider.getRating());
    }

    private ReviewResponse convertToResponse(Review review) {
        if (review == null) {
            return null;
        }
        
        String userName = (review.getUser() != null) ? review.getUser().getName() : "Unknown User";
        String bookingId = (review.getBooking() != null) ? review.getBooking().getId() : null;
        String serviceType = (review.getBooking() != null) ? review.getBooking().getServiceType() : null;

        return new ReviewResponse(
                review.getId(),
                userName,
                review.getRating(),
                review.getComment(),
                review.getCreatedAt(),
                bookingId,
                serviceType
        );
    }

    public boolean canUserReviewBooking(String userId, String bookingId) {
        // Check if booking exists and belongs to user
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Error: Booking not found."));

        if (!booking.getUser().getId().equals(userId)) {
            return false;
        }

        // Check if booking is completed
        if (booking.getStatus() != Booking.BookingStatus.COMPLETED) {
            return false;
        }

        // Check if review already exists
        return !reviewRepository.existsByBookingId(bookingId);
    }

    public ReviewResponse getReviewByBooking(String bookingId) {
        Review review = reviewRepository.findByBookingId(bookingId)
                .orElseThrow(() -> new RuntimeException("Error: Review not found for this booking."));
        
        return convertToResponse(review);
    }
}