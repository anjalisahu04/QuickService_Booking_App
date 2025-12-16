package com.quickServe.backend.Model;

import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Document(collection = "addresses")
@Data
@NoArgsConstructor
public class Address {
    
    @Id
    private String id;

    @DBRef
    private User user;

    @NotBlank
    @Size(max = 50)
    private String name; // Home, Work, Office, etc.

    @NotBlank
    @Size(max = 200)
    private String address;

    @NotBlank
    @Size(max = 50)
    private String city;

    @NotBlank
    @Size(max = 50)
    private String state;

    @NotBlank
    @Size(min = 6, max = 6)
    private String pincode;

    private boolean isDefault;

    public Address(User user, String name, String address, String city, String state, String pincode, boolean isDefault) {
        this.user = user;
        this.name = name;
        this.address = address;
        this.city = city;
        this.state = state;
        this.pincode = pincode;
        this.isDefault = isDefault;
    }
}