package com.quickServe.backend.Repository;

import com.quickServe.backend.Model.User;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import com.quickServe.backend.Model.Role;



@Repository
public interface UserRepository extends MongoRepository<User, String> {

    // This query is essential for the "user already exists" check
    Optional<User> findByEmail(String email);

    // This query checks if an email already exists in the database
    Boolean existsByEmail(String email);
    List<User> findByRole(Role role);
    long countByRole(Role role);
     @Query("{ 'role': 'PROVIDER', 'serviceType': { $regex: ?0, $options: 'i' } }")
    List<User> findProvidersByServiceType(String serviceType);
    
    // Find providers by city (if you have address information)
    @Query("{ 'role': 'PROVIDER', 'cities': { $in: ?0 } }")
    List<User> findProvidersByCities(List<String> cities);
}
