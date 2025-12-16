package com.quickServe.backend.Repository;

import com.quickServe.backend.Model.Address;
import com.quickServe.backend.Model.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface AddressRepository extends MongoRepository<Address, String> {
    
    List<Address> findByUser(User user);
    
    List<Address> findByUserId(String userId);
    
    Optional<Address> findByUserAndIsDefaultTrue(User user);
    
    Optional<Address> findByIdAndUser(String id, User user);
    
    void deleteByUser(User user);
    
    long countByUser(User user);
}