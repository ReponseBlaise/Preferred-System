package com.example;

import java.io.IOException;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@WebServlet("/redirect")
public class RedirectServlet extends HttpServlet {
    
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        
        // Get the search parameter from request
        String searchTerm = request.getParameter("search");
        
        if (searchTerm != null && !searchTerm.trim().isEmpty()) {
            // Encode the search term for URL
            String encodedSearch = java.net.URLEncoder.encode(searchTerm, "UTF-8");
            
            // Redirect to Google search with the search term
            response.sendRedirect("https://www.google.com/search?q=" + encodedSearch);
        } else {
            // If no search term, redirect to Google homepage
            response.sendRedirect("https://www.google.com");
        }
    }
}