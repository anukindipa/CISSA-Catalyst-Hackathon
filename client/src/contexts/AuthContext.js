import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session in localStorage
    const token = localStorage.getItem('skillsync_token');
    const userData = localStorage.getItem('skillsync_user');
    
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);


  const login = async (username, password) => {
    try {
      // Find the user by username in localStorage
      const existingUsers = JSON.parse(localStorage.getItem('skillsync_users') || '[]');
      const userData = existingUsers.find(u => u.username === username);

      if (!userData) {
        return { success: false, error: 'Invalid username or password' };
      }

      // Simple password check
      if (userData.password_hash !== password) {
        return { success: false, error: 'Invalid username or password' };
      }

      // Create a session token
      const sessionToken = Math.random().toString(36).substring(2);

      // Store session in localStorage
      localStorage.setItem('skillsync_token', sessionToken);
      localStorage.setItem('skillsync_user', JSON.stringify(userData));
      
      setUser(userData);
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Login failed' };
    }
  };

  const register = async (username, email, password) => {
    try {
      // Check if username already exists in localStorage
      const existingUsers = JSON.parse(localStorage.getItem('skillsync_users') || '[]');
      const existingUser = existingUsers.find(u => u.username === username);
      
      if (existingUser) {
        return { success: false, error: 'Username already exists' };
      }

      // Check if email already exists
      const existingEmail = existingUsers.find(u => u.email === email);
      if (existingEmail) {
        return { success: false, error: 'Email already exists' };
      }

      // Create new user
      const newUser = {
        id: Math.random().toString(36).substring(2),
        username,
        email,
        password_hash: password, // In production, hash this password
        avatar: {},
        created_at: new Date().toISOString()
      };

      // Add to localStorage
      existingUsers.push(newUser);
      localStorage.setItem('skillsync_users', JSON.stringify(existingUsers));

      return { success: true, user: newUser };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: 'Registration failed' };
    }
  };

  const setUserMajor = async (major) => {
    if (!user) return { success: false, error: 'Not logged in' };

    try {
      // Update user in localStorage
      const existingUsers = JSON.parse(localStorage.getItem('skillsync_users') || '[]');
      const userIndex = existingUsers.findIndex(u => u.id === user.id);
      
      if (userIndex !== -1) {
        existingUsers[userIndex].major = major;
        localStorage.setItem('skillsync_users', JSON.stringify(existingUsers));
      }

      const updatedUser = { ...user, major };
      setUser(updatedUser);
      localStorage.setItem('skillsync_user', JSON.stringify(updatedUser));
      return { success: true };
    } catch (error) {
      console.error('Set major error:', error);
      return { success: false, error: 'Failed to set major' };
    }
  };

  const updateUser = async (updates) => {
    if (!user) return { success: false, error: 'Not logged in' };
    
    try {
      // Update user in localStorage
      const existingUsers = JSON.parse(localStorage.getItem('skillsync_users') || '[]');
      const userIndex = existingUsers.findIndex(u => u.id === user.id);
      
      if (userIndex !== -1) {
        existingUsers[userIndex] = { ...existingUsers[userIndex], ...updates };
        localStorage.setItem('skillsync_users', JSON.stringify(existingUsers));
      }

      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      localStorage.setItem('skillsync_user', JSON.stringify(updatedUser));
      return { success: true, user: updatedUser };
    } catch (error) {
      console.error('Update user error:', error);
      return { success: false, error: 'Failed to update user' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('skillsync_token');
    localStorage.removeItem('skillsync_user');
  };

  const value = {
    user,
    login,
    register,
    logout,
    setUserMajor,
    updateUser,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
