package com.quickServe.backend.Service;

import com.quickServe.backend.Model.Address;
import com.quickServe.backend.Model.User;
import com.quickServe.backend.Payload.request.AddressRequest;
import com.quickServe.backend.Payload.response.AddressResponse;
import com.quickServe.backend.Repository.AddressRepository;
import com.quickServe.backend.Repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AddressService {

    @Autowired
    private AddressRepository addressRepository;

    @Autowired
    private UserRepository userRepository;

    public List<AddressResponse> getUserAddresses(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        
        List<Address> addresses = addressRepository.findByUser(user);
        return addresses.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    public AddressResponse addAddress(String userId, AddressRequest addressRequest) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        // If this address is set as default, update existing default addresses
        if (addressRequest.isDefault()) {
            List<Address> defaultAddresses = addressRepository.findByUser(user)
                    .stream()
                    .filter(Address::isDefault)
                    .collect(Collectors.toList());
            
            for (Address addr : defaultAddresses) {
                addr.setDefault(false);
                addressRepository.save(addr);
            }
        }

        Address address = new Address(
                user,
                addressRequest.getName(),
                addressRequest.getAddress(),
                addressRequest.getCity(),
                addressRequest.getState(),
                addressRequest.getPincode(),
                addressRequest.isDefault()
        );

        Address savedAddress = addressRepository.save(address);
        return convertToResponse(savedAddress);
    }

    public AddressResponse updateAddress(String userId, String addressId, AddressRequest addressRequest) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        Address address = addressRepository.findByIdAndUser(addressId, user)
                .orElseThrow(() -> new RuntimeException("Address not found with id: " + addressId));

        // If setting this address as default, update other addresses
        if (addressRequest.isDefault() && !address.isDefault()) {
            List<Address> defaultAddresses = addressRepository.findByUser(user)
                    .stream()
                    .filter(addr -> addr.isDefault() && !addr.getId().equals(addressId))
                    .collect(Collectors.toList());
            
            for (Address addr : defaultAddresses) {
                addr.setDefault(false);
                addressRepository.save(addr);
            }
        }

        address.setName(addressRequest.getName());
        address.setAddress(addressRequest.getAddress());
        address.setCity(addressRequest.getCity());
        address.setState(addressRequest.getState());
        address.setPincode(addressRequest.getPincode());
        address.setDefault(addressRequest.isDefault());

        Address updatedAddress = addressRepository.save(address);
        return convertToResponse(updatedAddress);
    }

    public void deleteAddress(String userId, String addressId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        Address address = addressRepository.findByIdAndUser(addressId, user)
                .orElseThrow(() -> new RuntimeException("Address not found with id: " + addressId));

        // Check if this is the only address
        long addressCount = addressRepository.countByUser(user);
        if (addressCount <= 1) {
            throw new RuntimeException("Cannot delete the only address. You must have at least one address.");
        }

        addressRepository.delete(address);

        // If deleted address was default, set another address as default
        if (address.isDefault()) {
            List<Address> remainingAddresses = addressRepository.findByUser(user);
            if (!remainingAddresses.isEmpty()) {
                Address newDefault = remainingAddresses.get(0);
                newDefault.setDefault(true);
                addressRepository.save(newDefault);
            }
        }
    }

    public AddressResponse setDefaultAddress(String userId, String addressId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        // Remove default from all addresses
        List<Address> addresses = addressRepository.findByUser(user);
        for (Address addr : addresses) {
            addr.setDefault(false);
            addressRepository.save(addr);
        }

        // Set new default address
        Address newDefault = addressRepository.findByIdAndUser(addressId, user)
                .orElseThrow(() -> new RuntimeException("Address not found with id: " + addressId));
        
        newDefault.setDefault(true);
        Address savedAddress = addressRepository.save(newDefault);
        
        return convertToResponse(savedAddress);
    }

    private AddressResponse convertToResponse(Address address) {
        return new AddressResponse(
                address.getId(),
                address.getName(),
                address.getAddress(),
                address.getCity(),
                address.getState(),
                address.getPincode(),
                address.isDefault()
        );
    }
    public List<Address> getAddressesByUserId(String userId) {
        return addressRepository.findByUserId(userId);
    }
}