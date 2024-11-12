import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../Request.css'

function Requests() {
  // Initialize requests state as an empty array to avoid "undefined" issues
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const { data } = await axios.get('/api/dashboard/requests', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setRequests(data.requests || []); // Set to empty array if no requests found
      } catch (error) {
        console.error('Error fetching requests:', error);
      }
    };
    fetchRequests();
  }, []);

  return (
    <div className="requests-section">
      <h2>Your Requests</h2>
      {/* Only render requests if they are available */}
      {requests && requests.length > 0 ? (
        requests.map((request) => (
          <div key={request._id} className="request-item">
            <h4>{request.title}</h4>
            <p>{request.description}</p>
            <p>Status: {request.status}</p>
          </div>
        ))
      ) : (
        <p>No requests available</p>
      )}
    </div>
  );
}

export default Requests;
