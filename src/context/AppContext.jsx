import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { auth } from '../firebase';

const AppContext = createContext();

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const [currentPage, setCurrentPage] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [heroContent, setHeroContent] = useState(null);
  const [myList, setMyList] = useState([]);
  const [userProfile, setUserProfile] = useState(() => {
    const savedProfile = localStorage.getItem('userProfile');
    return savedProfile ? JSON.parse(savedProfile) : {
      name: 'User',
      email: '',
      avatar: 'https://via.placeholder.com/120x120/e50914/ffffff?text=User',
      joinDate: new Date().toISOString().split('T')[0]
    };
  });
  const [viewingHistory, setViewingHistory] = useState(() => {
    const savedHistory = localStorage.getItem('viewingHistory');
    return savedHistory ? JSON.parse(savedHistory) : [];
  });

  // Helper to normalize first name from a name or email
  const getFirstName = (input) => {
    if (!input) return 'User';
    let base = input;
    if (base.includes('@')) base = base.split('@')[0];
    base = base.split(/[\s._-]+/)[0];
    base = base.replace(/\d+$/g, '');
    if (!base) base = 'User';
    return base.charAt(0).toUpperCase() + base.slice(1);
  };

  // Load user profile from auth shim
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        const derivedName = getFirstName(user.displayName || user.email);
        const newProfile = {
          ...userProfile,
          name: derivedName,
          email: user.email || userProfile.email || '',
          joinDate: user.metadata?.creationTime
            ? new Date(user.metadata.creationTime).toLocaleDateString()
            : new Date().toLocaleDateString()
        };
        setUserProfile(newProfile);
        localStorage.setItem('userProfile', JSON.stringify(newProfile));
      }
    });

    return () => unsubscribe();
  }, []);

  // Load hero content (featured movie/show)
  useEffect(() => {
    const loadHeroContent = async () => {
      try {
        const data = await apiService.getTrending('movie', 'day', 1);
        if (data.results && data.results.length > 0) {
          setHeroContent(data.results[0]);
        }
      } catch (error) {
        console.error('Error loading hero content:', error);
      }
    };
    loadHeroContent();
  }, []);

  // Search functionality
  const handleSearch = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    try {
      const results = await apiService.search(query);
      setSearchResults(results.results || []);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Add to My List
  const addToMyList = (item) => {
    setMyList(prev => {
      const exists = prev.find(existing => existing.id === item.id);
      if (!exists) {
        return [...prev, item];
      }
      return prev;
    });
  };

  // Remove from My List
  const removeFromMyList = (itemId) => {
    setMyList(prev => prev.filter(item => item.id !== itemId));
  };

  // Check if item is in My List
  const isInMyList = (itemId) => {
    return myList.some(item => item.id === itemId);
  };

  // Add notification
  const addNotification = (message, type = 'info') => {
    const notification = {
      id: Date.now(),
      message,
      type,
      timestamp: new Date()
    };
    setNotifications(prev => [notification, ...prev]);
    
    // Auto-remove notification after 5 seconds
    setTimeout(() => {
      removeNotification(notification.id);
    }, 5000);
  };

  // Remove notification
  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  // Add to viewing history
  const addToViewingHistory = (item) => {
    const historyItem = {
      ...item,
      watchedAt: new Date().toISOString(),
      id: item.id
    };
    
    setViewingHistory(prev => {
      // Remove if already exists to avoid duplicates
      const filtered = prev.filter(existing => existing.id !== item.id);
      // Add to beginning of array (most recent first)
      const newHistory = [historyItem, ...filtered].slice(0, 50); // Keep only last 50 items
      localStorage.setItem('viewingHistory', JSON.stringify(newHistory));
      return newHistory;
    });
  };

  // Clear viewing history
  const clearViewingHistory = () => {
    setViewingHistory([]);
    localStorage.removeItem('viewingHistory');
  };

  // Update user profile
  const updateUserProfile = (updates) => {
    const newProfile = { ...userProfile, ...updates };
    setUserProfile(newProfile);
    localStorage.setItem('userProfile', JSON.stringify(newProfile));
  };

  const value = {
    currentPage,
    setCurrentPage,
    searchQuery,
    setSearchQuery,
    searchResults,
    isSearching,
    notifications,
    heroContent,
    myList,
    userProfile,
    viewingHistory,
    handleSearch,
    addToMyList,
    removeFromMyList,
    isInMyList,
    addNotification,
    removeNotification,
    addToViewingHistory,
    clearViewingHistory,
    updateUserProfile
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};