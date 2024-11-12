import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './css/Register.css';

function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNo: '',
    password: '',
    confirmPassword: '',
    role: 'seeker',
    location: { type: 'Point', coordinates: [] },
    address: '',
    preferences: [],
  });

  const [loadingLocation, setLoadingLocation] = useState(true);
  const [passwordError, setPasswordError] = useState('');
  const [suggestions, setSuggestions] = useState([]); // State for storing address suggestions
  const navigate = useNavigate();

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Real-time validation for password match
    if (name === 'confirmPassword' || name === 'password') {
      if (formData.password !== value && name === 'confirmPassword') {
        setPasswordError('Passwords do not match');
      } else if (name === 'password' && formData.confirmPassword !== '' && value !== formData.confirmPassword) {
        setPasswordError('Passwords do not match');
      } else {
        setPasswordError('');
      }
    }
  };
  const handlePreferencesChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions).map(option => option.value);
    setFormData((prevData) => ({
      ...prevData,
      preferences: selectedOptions
    }));
  };
  // Handle address input change and get suggestions
  const handleAddressInputChange = async (e) => {
    const query = e.target.value;
    setFormData({ ...formData, address: query });

    if (query.length > 3) {
      try {
        // Fetch suggestions from your backend geocode API
        const response = await axios.get('http://localhost:5001/api/services/geocode', {
          params: {
            query: query,
          },
        });
        setSuggestions(response.data.items || []);
        setLoadingLocation(false);
      } catch (error) {
        console.error('Error fetching suggestions from HERE Maps:', error);
      }
    } else {
      setSuggestions([]); // Clear suggestions if input is less than 3 characters
    }
  };

  // Handle address selection from suggestions
  const handleAddressSelect = (address, lat, lng) => {
    setFormData((prevData) => ({
      ...prevData,
      address: address,
      location: { type: 'Point', coordinates: [lng, lat] },
    }));
    setSuggestions([]); // Clear suggestions once the address is selected
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    try {
      await axios.post('/api/auth/register', formData);
      alert('Registration successful');
      navigate('/dashboard');
    } catch (error) {
      if (error.response && error.response.status === 409) {
        alert(error.response.data.message);
      } else {
        console.error('Error registering user:', error);
        alert('Registration failed');
      }
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <h2>Signup</h2>
        <form onSubmit={handleSubmit} className="register-form">
          <div className="form-group">
            <label>Name</label>
            <input type="text" name="name" onChange={handleChange} required placeholder="Enter your name" />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input type="email" name="email" onChange={handleChange} required placeholder="Enter your email" />
          </div>

          <div className="form-group">
            <label>Phone Number</label>
            <input type="text" name="phoneNo" onChange={handleChange} required placeholder="Enter your phone number" />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input type="password" name="password" onChange={handleChange} required placeholder="Create password" />
          </div>

          <div className="form-group">
            <label>Confirm Password</label>
            <input type="password" name="confirmPassword" onChange={handleChange} required placeholder="Confirm password" />
            {passwordError && <p className="error-text">{passwordError}</p>}
          </div>

          <div className="form-group">
            <label>Role</label>
            <select name="role" onChange={handleChange} required>
              <option value="seeker">Seeker</option>
              <option value="volunteer">Volunteer</option>
            </select>
          </div>

          <div className="form-group" style={{ position: 'relative' }}>
            <label>Address</label>
            <input
              type="text"
              value={formData.address}
              onChange={handleAddressInputChange}
              placeholder="Enter your address"
              className="address-input"
            />
            {/* Display address suggestions */}
            {suggestions.length > 0 && (
              <ul className="suggestions-dropdown">
                {suggestions.map((suggestion) => (
                  <li
                    key={suggestion.id}
                    onClick={() =>
                      handleAddressSelect(suggestion.address.label, suggestion.position.lat, suggestion.position.lng)
                    }
                  >
                    {suggestion.address.label}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="form-group">
            <label>Preferences</label>
            <select name="preferences" onChange={handlePreferencesChange}>
              <option value="">Select a preference</option>
              {formData.role === 'seeker'
                ? [
                    'Patient',
                    'Lonely Individual',
                    'Senior Citizen',
                    'Transport Needer',
                    'Learner',
                    'Homeowner in Need',
                    'Stressed Individual',
                    'Parent in Need',
                    'Food Assistance Needer',
                    'Tech Learner',
                  ].map((pref) => (
                    <option key={pref} value={pref}>
                      {pref}
                    </option>
                  ))
                : [
                    'Health Aide',
                    'Companion',
                    'Elder Care Assistant',
                    'Driver',
                    'Tutor',
                    'Handy Helper',
                    'Mental Health Supporter',
                    'Childcare Helper',
                    'Grocery Shopper/Meal Provider',
                    'Tech Helper',
                  ].map((pref) => (
                    <option key={pref} value={pref}>
                      {pref}
                    </option>
                  ))}
            </select>
          </div>

          <button type="submit" className="register-button" disabled={loadingLocation}>
            {loadingLocation ? 'Signup' : 'Signup'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Register;
