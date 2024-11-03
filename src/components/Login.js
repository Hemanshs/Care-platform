import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import "./css/Login.css";

function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const handleResendVerification = async () => {
    try {
      const response = await axios.post('http://localhost:5001/api/auth/resend-verification', { email: formData.email });
      alert(response.data.message);
    } catch (error) {
      console.error('Error resending verification email:', error);
      alert('Failed to resend verification email. Please try again later.');
    }
  };
  
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5001/api/auth/login', formData);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        console.log('Token stored:', response.data.token);
        navigate('/dashboard'); // Redirect to dashboard
      } else {
        console.error('Token not received in response:', response);
        alert('Login successful but token is missing. Please try again.');
      }
    } catch (error) {
      if (error.response && error.response.status === 400) {
        // If the user's email is not verified, offer to resend verification
        if (window.confirm('Your email is not verified. Would you like to resend the verification email?')) {
          handleResendVerification();
        }
      } else {
        console.error('Error logging in:', error);
        alert('Invalid credentials or other login failure.');
      }
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Login to Your Account</h2>
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              onChange={handleChange}
              required
            />
          </div>
          <button type="submit" className="login-button">Login</button>
        </form>
        <div className="additional-links">
          <a href="/forgot-password">Forgot Password?</a>
          <a href="/register">Don't have an account? Sign Up</a>
        </div>
      </div>
    </div>
  );
}

export default Login;
