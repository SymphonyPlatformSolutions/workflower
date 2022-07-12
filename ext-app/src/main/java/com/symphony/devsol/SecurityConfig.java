package com.symphony.devsol;

import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;

@EnableWebSecurity
public class SecurityConfig extends WebSecurityConfigurerAdapter {
    @Override
    protected void configure(HttpSecurity http) throws Exception {
        // This configuration is not recommended in production setup
        http.authorizeRequests().anyRequest().permitAll();  // Make Spring Security allows any incoming message
        http.csrf().disable();  // Disable CSRF protection to make the call to the ext app internal apis from Symphony clients.
        http.headers().frameOptions().disable();    // Allow to display controller.html in a frame of Symphony clients.
    }
}
