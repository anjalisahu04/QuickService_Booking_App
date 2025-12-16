package com.quickServe.backend.Repository;

import com.quickServe.backend.Model.Review;
import com.quickServe.backend.Model.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewRepository extends MongoRepository<Review, String> {
    
    List<Review> findByProviderId(String providerId);
    
    List<Review> findByProviderOrderByCreatedAtDesc(User provider);
    
    Optional<Review> findByBookingId(String bookingId);
    
    List<Review> findByUserId(String userId);
    
    boolean existsByBookingId(String bookingId);
    
    @Query(value = "{ 'provider.$id': ?0 }", count = true)
    long countByProviderId(String providerId);
    
    @Query(value = "{ 'provider.$id': ?0 }", fields = "{ 'rating': 1 }")
    List<Review> findRatingsByProviderId(String providerId);
}