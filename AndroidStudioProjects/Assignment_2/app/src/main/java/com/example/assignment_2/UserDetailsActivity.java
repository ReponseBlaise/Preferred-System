package com.example.assignment_2;

import androidx.appcompat.app.AppCompatActivity;
import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.CheckBox;
import android.widget.TextView;
import android.widget.Toast;

public class UserDetailsActivity extends AppCompatActivity {

    private TextView tvWelcome, tvEmail, tvGender;
    private CheckBox cbNotifications;
    private Button btnLogout;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_user_details);

        // Initialize views
        tvWelcome = findViewById(R.id.tvWelcome);
        tvEmail = findViewById(R.id.tvEmail);
        tvGender = findViewById(R.id.tvGender);
        cbNotifications = findViewById(R.id.cbNotifications);
        btnLogout = findViewById(R.id.btnLogout);

        // Get data from intent
        Intent intent = getIntent();
        String fullName = intent.getStringExtra("FULL_NAME");
        String email = intent.getStringExtra("EMAIL");
        String gender = intent.getStringExtra("GENDER");
        String username = intent.getStringExtra("USERNAME");

        // Set data to views
        if (fullName != null && !fullName.isEmpty()) {
            tvWelcome.setText("Welcome, " + fullName + "!");
        } else if (username != null && !username.isEmpty()) {
            tvWelcome.setText("Welcome, " + username + "!");
        }

        if (email != null && !email.isEmpty()) {
            tvEmail.setText("Email: " + email);
        }

        if (gender != null && !gender.isEmpty()) {
            tvGender.setText("Gender: " + gender);
        }

        // Checkbox listener
        cbNotifications.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                if (cbNotifications.isChecked()) {
                    Toast.makeText(UserDetailsActivity.this, "Notifications enabled", Toast.LENGTH_SHORT).show();
                } else {
                    Toast.makeText(UserDetailsActivity.this, "Notifications disabled", Toast.LENGTH_SHORT).show();
                }
            }
        });

        // Logout button click listener
        btnLogout.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                // Navigate back to Login screen
                Intent intent = new Intent(UserDetailsActivity.this, LoginActivity.class);
                startActivity(intent);
                finish(); // Close current activity
                Toast.makeText(UserDetailsActivity.this, "Logged out successfully", Toast.LENGTH_SHORT).show();
            }
        });
    }
}