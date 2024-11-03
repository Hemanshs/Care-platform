import React, { useState, useEffect } from 'react';
import axios from 'axios';
import "./css/CreateRequest.css";
import Sidebar from './Sidebar';
function CreateRequest() {
  const [request, setRequest] = useState({
    title: '',
    description: '',
    location: { type: 'Point', coordinates: [] },
    preferences: [],
  });

  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(''); // Added state for user role

  useEffect(() => {
    // Fetch the user's role from localStorage or API
    const fetchUserRole = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No token found');
        }
        const { data } = await axios.get('http://localhost:5001/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUserRole(data.role);
      } catch (error) {
        console.error('Error fetching user role:', error);
      }
    };

    // Fetch user's role
    fetchUserRole();

    // Get user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setRequest((prevData) => ({
            ...prevData,
            location: {
              type: 'Point',
              coordinates: [position.coords.longitude, position.coords.latitude],
            },
          }));
          setLoading(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          setRequest((prevData) => ({
            ...prevData,
            location: {
              type: 'Point',
              coordinates: [-74.006, 40.7128], // Default to New York City
            },
          }));
          setLoading(false);
        }
      );
    } else {
      setRequest((prevData) => ({
        ...prevData,
        location: {
          type: 'Point',
          coordinates: [-74.006, 40.7128], // Default to New York City
        },
      }));
      setLoading(false);
    }
  }, []);

  const handleChange = (e) => {
    setRequest({ ...request, [e.target.name]: e.target.value });
  };

  const handlePreferencesChange = (e) => {
    const value = e.target.value;
    if (value && !request.preferences.includes(value)) {
      setRequest({ ...request, preferences: [...request.preferences, value] });
    }
  };

  const handleCreate = async () => {
    try {
      await axios.post('http://localhost:5001/api/requests', request, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      alert('Request created successfully');
    } catch (error) {
      console.error('Error creating request:', error);
      alert('Failed to create request');
    }
  };

  // Define preferences based on user role
  const availablePreferences = userRole === 'seeker' ? [
    'Patient',
    'Lonely Individual',
    'Senior Citizen',
    'Transport Needer',
    'Learner',
    'Homeowner in Need',
    'Stressed Individual',
    'Parent in Need',
    'Food Assistance Needer',
    'Tech Learner'
  ] : [
    'Health Aide',
    'Companion',
    'Elder Care Assistant',
    'Driver',
    'Tutor',
    'Handy Helper',
    'Mental Health Supporter',
    'Childcare Helper',
    'Grocery Shopper/Meal Provider',
    'Tech Helper'
  ];

  return (
    <div className="dashboard-container">
      <Sidebar userRole={userRole} />
      <div className="create-request-section">
        {userRole === 'seeker' ? (
          <>
            <h2>Create a Request</h2>
            <div className="form-group">
              <label>Title</label>
              <input type="text" name="title" onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea name="description" onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Preferences (Choose categories that match your need)</label>
              <select onChange={handlePreferencesChange}>
                <option value="">Select a preference</option>
                {availablePreferences.map((preference) => (
                  <option key={preference} value={preference}>
                    {preference}
                  </option>
                ))}
              </select>
              <div className="preferences-list">
                {request.preferences.map((pref, index) => (
                  <span key={index} className="preference-item">
                    {pref}
                    <button onClick={() => setRequest({
                      ...request,
                      preferences: request.preferences.filter((p) => p !== pref)
                    })}>x</button>
                  </span>
                ))}
              </div>
            </div>
            <button onClick={handleCreate} disabled={loading}>
              {loading ? 'Loading Location...' : 'Create Request'}
            </button>
          </>
        ) : (
          <p>You do not have permission to create a request.</p>
        )}
      </div>
    </div>
  );
}

export default CreateRequest;
