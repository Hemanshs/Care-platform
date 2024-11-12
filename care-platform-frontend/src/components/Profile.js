import React, { useState, useEffect } from 'react';
import axios from 'axios';
import "./css/Profile.css";
import Sidebar from './Sidebar';
function Profile() {
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phoneNo: '',
    preferences: [],
    role: '',
  });
  const [tempProfile, setTempProfile] = useState({
    name: '',
    phoneNo: '',
  });
  const [availablePreferences, setAvailablePreferences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingField, setEditingField] = useState('');
  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No token found');
        }
        const { data } = await axios.get('http://localhost:5001/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserRole(data.role);
        setProfile(data);

        const allPreferences =
          data.role === 'seeker'
            ? [
                'Patient', 'Lonely Individual', 'Senior Citizen', 'Transport Needer',
                'Learner', 'Homeowner in Need', 'Stressed Individual', 'Parent in Need',
                'Food Assistance Needer', 'Tech Learner',
              ]
            : [
                'Health Aide', 'Companion', 'Elder Care Assistant', 'Driver',
                'Tutor', 'Handy Helper', 'Mental Health Supporter', 'Childcare Helper',
                'Grocery Shopper/Meal Provider', 'Tech Helper',
              ];

        const userPreferences = data.preferences;
        const filteredPreferences = allPreferences.filter(
          (preference) => !userPreferences.includes(preference)
        );

        setAvailablePreferences(filteredPreferences);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };
    fetchProfile();
  }, []);

  const handleEdit = (field) => {
    setEditingField(field);
    setTempProfile({ ...profile });
  };

  const handleCancelEdit = () => {
    setEditingField('');
    setTempProfile({});
  };

  const handleSave = async () => {
    if (!tempProfile.name || !tempProfile.name.trim() || !tempProfile.phoneNo || !tempProfile.phoneNo.trim()) {
      alert('Name and Phone Number cannot be empty');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.put('http://localhost:5001/api/auth/me', tempProfile, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfile(tempProfile);
      setEditingField('');
      alert('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    }
  };

  const handlePreferencesChange = (e) => {
    const selectedPreference = e.target.value;
    if (selectedPreference && !profile.preferences.includes(selectedPreference)) {
      setProfile((prevProfile) => ({
        ...prevProfile,
        preferences: [...prevProfile.preferences, selectedPreference],
      }));

      setAvailablePreferences((prevAvailable) =>
        prevAvailable.filter((pref) => pref !== selectedPreference)
      );
    }
  };

  const removePreference = (preferenceToRemove) => {
    setProfile((prevProfile) => ({
      ...prevProfile,
      preferences: prevProfile.preferences.filter(
        (pref) => pref !== preferenceToRemove
      ),
    }));

    setAvailablePreferences((prevAvailable) => [
      ...prevAvailable,
      preferenceToRemove,
    ]);
  };

  const handleSavePreferences = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put('http://localhost:5001/api/auth/me', {
        ...profile,
        preferences: profile.preferences,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Preferences updated successfully');
    } catch (error) {
      console.error('Error updating preferences:', error);
      alert('Failed to update preferences');
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar userRole={userRole} />
      <div className="profile-section">
        <h2>Your Profile</h2>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <>
            <div className="form-group">
              <label>Name</label>
              {editingField === 'name' ? (
                <div className="edit-container">
                  <input
                    type="text"
                    name="name"
                    value={tempProfile.name}
                    onChange={(e) => setTempProfile({ ...tempProfile, name: e.target.value })}
                  />
                  <button className="save-button" onClick={handleSave}>Save</button>
                  <button className="cancel-button" onClick={handleCancelEdit}>Cancel</button>
                </div>
              ) : (
                <div className="editable-field">
                  <span>{profile.name}</span>
                  <button className="profile-edit" onClick={() => handleEdit('name')}>
                    Edit
                  </button>
                </div>
              )}
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" value={profile.email} readOnly />
            </div>
            <div className="form-group">
              <label>Phone Number</label>
              {editingField === 'phoneNo' ? (
                <div className="edit-container">
                  <input
                    type="text"
                    name="phoneNo"
                    value={tempProfile.phoneNo}
                    onChange={(e) => setTempProfile({ ...tempProfile, phoneNo: e.target.value })}
                  />
                  <button className="save-button" onClick={handleSave}>Save</button>
                  <button className="cancel-button" onClick={handleCancelEdit}>Cancel</button>
                </div>
              ) : (
                <div className="editable-field">
                  <span>{profile.phoneNo}</span>
                  <button className="profile-edit" onClick={() => handleEdit('phoneNo')}>
                    Edit
                  </button>
                </div>
              )}
            </div>
            <div className="form-group">
              <label>Preferences</label>
              <select className="select-preferences" value="" onChange={handlePreferencesChange}>
                <option value="" disabled>Select a preference</option>
                {availablePreferences.map((preference) => (
                  <option key={preference} value={preference}>
                    {preference}
                  </option>
                ))}
              </select>
              <div className="preferences-list">
                {profile.preferences && profile.preferences.length > 0 ? (
                  profile.preferences.map((pref, index) => (
                    <span key={index} className="preference-item">
                      {pref}
                      <button onClick={() => removePreference(pref)}>x</button>
                    </span>
                  ))
                ) : (
                  <p>No preferences selected.</p>
                )}
              </div>
              <button className="save-button" onClick={handleSavePreferences}>Save Preferences</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Profile;
