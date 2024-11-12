import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import './css/Dashboard.css';
import Sidebar from './Sidebar';
import { ClipLoader } from 'react-spinners'; // Import spinner component
function Dashboard() {
  const [users, setUsers] = useState([]);
  const [userRole, setUserRole] = useState('');
  const [requests, setRequests] = useState([]);
  const [profile, setProfile] = useState({});
  const [loading, setLoading] = useState(true);
  const [requestLocations, setRequestLocations] = useState({});

  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsersAndProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          alert('Token not found. Redirecting to login.');
          navigate('/login');
          return;
        }

        // Fetch logged-in user profile
        const profileResponse = await axios.get('http://localhost:5001/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const currentUser = profileResponse.data;
        setProfile(currentUser);
        setUserRole(currentUser.role);

        // Fetch the list of users
        const { data } = await axios.get('http://localhost:5001/api/auth/user', {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Filter users based on the role of the current user
        const filteredUsers = data.filter((user) =>
          currentUser.role === 'seeker' ? user.role === 'volunteer' : user.role === 'seeker'
        );

        // Fetch all requests
        const response = await axios.get('http://localhost:5001/api/requests', {
          headers: { Authorization: `Bearer ${token}` },
        });

        setRequests(response.data.requests || []);
        setUsers(filteredUsers);
        setLoading(false);

        // Fetch locations for all requests
        response.data.requests.forEach((req) => {
          handleLocationFetch(req._id, req.location.coordinates[1], req.location.coordinates[0]);
        });
      } catch (error) {
        console.error('Error fetching data:', error);
        alert('Failed to fetch data. Please log in again.');
        setLoading(false);
        navigate('/login');
      }
    };

    fetchUsersAndProfile();
  }, [navigate]);

  const handleLocationFetch = async (requestId, latitude, longitude) => {
    try {
      const config = {
        method: 'get',
        url: `https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&apiKey=6c53724bcfda46c3ad636fa1de75499a`,
        headers: {},
      };

      const response = await axios(config);
      if (response.data.features && response.data.features.length > 0) {
        setRequestLocations((prevLocations) => ({
          ...prevLocations,
          [requestId]: response.data.features[0].properties.formatted,
        }));
      } else {
        setRequestLocations((prevLocations) => ({
          ...prevLocations,
          [requestId]: 'Location not found',
        }));
      }
    } catch (error) {
      console.error('Error fetching location:', error);
      setRequestLocations((prevLocations) => ({
        ...prevLocations,
        [requestId]: 'Error fetching location',
      }));
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar userRole={userRole} />
      <div className="dashboard-content">
        <div className="welcome-section">
          <h1>Welcome, {profile.name}</h1>
          <h2>Your Role: {profile.role}</h2>
        </div>

        {/* Users Section */}
        <div className="user-section">
          <h2>{profile.role === 'seeker' ? 'Available Volunteers' : 'Available Seekers'}</h2>
          {loading ? (
            <div className="loading-container">
            <ClipLoader color="#005eb8" loading={loading} size={50} />
          </div>
          ) : users.length > 0 ? (
            <div className="user-list">
              {users.map((user, index) => (
                <div key={index} className="user-card">
                  <h3>{user.name}</h3>
                  <p>
                    <strong>Email:</strong> {user.email}
                  </p>
                  <p>
                    <strong>Phone Number:</strong> {user.phoneNo}
                  </p>
                  {user.preferences.length > 0 && (
                    <>
                      <p>
                        <strong>Preferences:</strong>
                      </p>
                      <ul>
                        {user.preferences.map((pref, pindex) => (
                          <li key={pindex}>{pref}</li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p>No users available</p>
          )}
        </div>

        {/* Requests Section */}
        <div className="requests-section">
          <h2>Available Requests</h2>
          {loading ? (
            <p>Loading requests...</p>
          ) : requests.length > 0 ? (
            <div className="request-list">
              {requests.map((request, index) => (
                <div key={index} className="request-card">
                  <h3>{request.title}</h3>
                  <p>
                    <strong>Description:</strong> {request.description}
                  </p>
                  <p>
                    <strong>Location:</strong> {requestLocations[request._id] || 'Loading...'}
                  </p>
                  {request.preferences.length > 0 && (
                    <>
                      <p>
                        <strong>Preferences:</strong>
                      </p>
                      <ul>
                        {request.preferences.map((pref, prefIndex) => (
                          <li key={prefIndex}>{pref}</li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p>No requests available</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
