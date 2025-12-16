package com.quickServe.backend.Repository;

import com.quickServe.backend.Model.Booking;
import com.quickServe.backend.Model.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface BookingRepository extends MongoRepository<Booking, String> {
    List<Booking> findByUser(User user);
    List<Booking> findByProvider(User provider);
    List<Booking> findByProviderAndStatus(User provider, Booking.BookingStatus status);
    List<Booking> findByStatus(Booking.BookingStatus status);
    List<Booking> findByIsPaid(Boolean isPaid);
    
    @Query("{ 'user.$id': ?0 }")
    List<Booking> findByUserId(String userId);
}