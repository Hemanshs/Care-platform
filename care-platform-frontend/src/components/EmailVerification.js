
// components/EmailVerification.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';

function EmailVerification() {
  const [message, setMessage] = useState('Verifying your email...');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const verifyEmail = async () => {
      const params = new URLSearchParams(location.search);
      const token = params.get('token');
      try {
        await axios.get(`/api/auth/verify-email?token=${token}`);
        setMessage('Email verified successfully. Redirecting to login...');
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } catch (error) {
        setMessage('Verification failed. The token may be invalid or expired.');
      }
    };
    verifyEmail();
  }, [location, navigate]);

  return (
    <div className="container">
      <h2>{message}</h2>
    </div>
  );
}

export default EmailVerification;