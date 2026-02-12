import React, { useState } from 'react'
import './Profile.css'
import { useAppContext } from '../../context/AppContext'
import { useNavigate } from 'react-router-dom'
import back_arrow_icon from '../../assets/back_arrow_icon.png'

const Profile = () => {
  const { 
    userProfile, 
    updateUserProfile, 
    viewingHistory, 
    clearViewingHistory,
    addNotification 
  } = useAppContext();
  
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: userProfile.name
  });


  const handleSave = () => {
    updateUserProfile(editForm);
    setIsEditing(false);
    addNotification('Profile updated successfully', 'success');
  };

  const handleClearHistory = () => {
    clearViewingHistory();
    addNotification('Viewing history cleared', 'info');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className='profile-page'>
      <div className="profile-header">
        <img 
          src={back_arrow_icon} 
          alt="Back" 
          className="back-btn"
          onClick={() => navigate(-1)}
        />
        <h1>My Profile</h1>
      </div>

      <div className="profile-content">
        <div className="profile-info-section">
          <div className="profile-avatar">
            <div className="avatar-container">
              <div className="profile-avatar-circle">
                {userProfile.name ? userProfile.name.charAt(0).toUpperCase() : 'U'}
              </div>
            </div>
            <div className="profile-details">
              {isEditing ? (
                <div className="edit-form">
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                    placeholder="Name"
                  />
                  <div className="email-display">
                    <label>Email (cannot be changed):</label>
                    <span>{userProfile.email || 'No email set'}</span>
                  </div>
                  <div className="edit-buttons">
                    <button onClick={handleSave} className="save-btn">Save</button>
                    <button onClick={() => setIsEditing(false)} className="cancel-btn">Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="profile-info">
                  <h2>{userProfile.name}</h2>
                  <p className="email">{userProfile.email || 'No email set'}</p>
                  <p className="join-date">Member since {formatDate(userProfile.joinDate)}</p>
                  <button onClick={() => setIsEditing(true)} className="edit-btn">
                    Edit Profile
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="viewing-history-section">
          <div className="section-header">
            <h3>Viewing History</h3>
            {viewingHistory.length > 0 && (
              <button onClick={handleClearHistory} className="clear-history-btn">
                Clear History
              </button>
            )}
          </div>
          
          {viewingHistory.length === 0 ? (
            <div className="empty-history">
              <p>No viewing history yet. Start watching to see your history here!</p>
            </div>
          ) : (
            <div className="history-list">
              {viewingHistory.map((item, index) => (
                <div key={`${item.id}-${index}`} className="history-item">
                  <img 
                    src={`https://image.tmdb.org/t/p/w200${item.backdrop_path || item.poster_path}`} 
                    alt={item.title || item.name}
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/200x113/333/fff?text=No+Image';
                    }}
                  />
                  <div className="history-info">
                    <h4>{item.title || item.name}</h4>
                    <p className="watch-date">Watched on {formatDate(item.watchedAt)}</p>
                    <p className="overview">{item.overview?.slice(0, 150)}...</p>
                  </div>
                  <button 
                    className="watch-again-btn"
                    onClick={() => navigate(`/player/${item.id}`)}
                  >
                    Watch Again
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Profile