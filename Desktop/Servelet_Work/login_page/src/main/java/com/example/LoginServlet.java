package com.example;

import java.io.IOException;
import java.io.PrintWriter;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@WebServlet("/login")
public class LoginServlet extends HttpServlet {
    
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        
        // Set response content type
        response.setContentType("text/html");
        
        // Get parameters from request
        String username = request.getParameter("username");
        String password = request.getParameter("password");
        
        // Create PrintWriter for response
        PrintWriter out = response.getWriter();
        
        // Generate HTML response
        out.println("<!DOCTYPE html>");
        out.println("<html>");
        out.println("<head>");
        out.println("<title>Login Result</title>");
        out.println("<style>");
        out.println("body { font-family: Arial, sans-serif; margin: 50px; }");
        out.println(".result { padding: 20px; border-radius: 5px; margin: 20px 0; }");
        out.println(".weak { background-color: #ffebee; color: #c62828; border: 1px solid #ef9a9a; }");
        out.println(".strong { background-color: #e8f5e9; color: #2e7d32; border: 1px solid #a5d6a7; }");
        out.println("</style>");
        out.println("</head>");
        out.println("<body>");
        out.println("<h2>Login Result</h2>");
        
        // Check password length and display appropriate message
        if (password.length() < 8) {
            out.println("<div class='result weak'>");
            out.println("<h3>Weak Password Detected!</h3>");
            out.println("<p>Hello <strong>" + username + "</strong>, your password is weak. Try a strong one.</p>");
            out.println("<p>Password length: " + password.length() + " characters (minimum 8 required)</p>");
        } else {
            out.println("<div class='result strong'>");
            out.println("<h3>Login Successful!</h3>");
            out.println("<p>Welcome <strong>" + username + "</strong></p>");
            out.println("<p>Password strength: Strong (" + password.length() + " characters)</p>");
        }
        
        out.println("</div>");
        out.println("<a href='login.html'>Back to Login</a> | ");
        out.println("<a href='redirect.html'>Go to Assignment 2</a>");
        out.println("</body>");
        out.println("</html>");
        
        out.close();
    }
}