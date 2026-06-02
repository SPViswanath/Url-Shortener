import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <p>Loading...</p>
      </div>
    );
  }

  // If the user is already signed in, redirect them to the dashboard
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  // Otherwise, allow them to view the public page (login/signup)
  return children;
};

export default PublicRoute;
