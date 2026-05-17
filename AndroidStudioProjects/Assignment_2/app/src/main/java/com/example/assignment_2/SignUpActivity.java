package com.example.assignment_2;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.CheckBox;
import android.widget.EditText;
import android.widget.RadioGroup;
import android.widget.Toast;
import androidx.appcompat.app.AppCompatActivity;

public class SignUpActivity extends AppCompatActivity {

    private EditText etFullName, etEmail, etPassword, etConfirmPassword;
    private RadioGroup rgGender;
    private CheckBox cbTerms;
    private Button btnSignUp;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_sign_up);

        // Initialize views
        etFullName = findViewById(R.id.etFullName);
        etEmail = findViewById(R.id.etEmail);
        etPassword = findViewById(R.id.etPassword);
        etConfirmPassword = findViewById(R.id.etConfirmPassword);
        rgGender = findViewById(R.id.rgGender);
        cbTerms = findViewById(R.id.cbTerms);
        btnSignUp = findViewById(R.id.btnSignUp);

        // Sign Up button click listener
        btnSignUp.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                if (validateSignUp()) {
                    // Show success toast
                    Toast.makeText(SignUpActivity.this, "Account created successfully!", Toast.LENGTH_SHORT).show();

                    // Get selected gender
                    String gender = "Not specified";
                    int selectedId = rgGender.getCheckedRadioButtonId();
                    if (selectedId == R.id.rbMale) {
                        gender = "Male";
                    } else if (selectedId == R.id.rbFemale) {
                        gender = "Female";
                    } else if (selectedId == R.id.rbOther) {
                        gender = "Other";
                    }

                    // Navigate to User Details screen with data
                    Intent intent = new Intent(SignUpActivity.this, UserDetailsActivity.class);
                    intent.putExtra("FULL_NAME", etFullName.getText().toString());
                    intent.putExtra("EMAIL", etEmail.getText().toString());
                    intent.putExtra("GENDER", gender);
                    startActivity(intent);
                }
            }
        });
    }

    private boolean validateSignUp() {
        String fullName = etFullName.getText().toString().trim();
        String email = etEmail.getText().toString().trim();
        String password = etPassword.getText().toString().trim();
        String confirmPassword = etConfirmPassword.getText().toString().trim();

        // Check for empty fields
        if (fullName.isEmpty()) {
            etFullName.setError("Full name is required");
            return false;
        }

        if (email.isEmpty()) {
            etEmail.setError("Email is required");
            return false;
        }

        if (password.isEmpty()) {
            etPassword.setError("Password is required");
            return false;
        }

        if (confirmPassword.isEmpty()) {
            etConfirmPassword.setError("Please confirm password");
            return false;
        }

        // Check if passwords match
        if (!password.equals(confirmPassword)) {
            etConfirmPassword.setError("Passwords do not match");
            return false;
        }

        // Check if gender is selected
        if (rgGender.getCheckedRadioButtonId() == -1) {
            Toast.makeText(this, "Please select gender", Toast.LENGTH_SHORT).show();
            return false;
        }

        // Check if terms are accepted
        if (!cbTerms.isChecked()) {
            Toast.makeText(this, "Please accept terms and conditions", Toast.LENGTH_SHORT).show();
            return false;
        }

        return true;
    }
}