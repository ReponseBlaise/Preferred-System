package com.example.employeemanagementsystem.model;

import java.io.Serializable;

public class Employee implements Serializable {
    private String employeeId;
    private String name;
    private String gender;
    private String email;
    private String phone;

    public Employee(String employeeId, String name, String gender, String email, String phone) {
        this.employeeId = employeeId;
        this.name = name;
        this.gender = gender;
        this.email = email;
        this.phone = phone;
    }

    public String getEmployeeId() { return employeeId; }
    public String getName() { return name; }
    public String getGender() { return gender; }
    public String getEmail() { return email; }
    public String getPhone() { return phone; }
}
