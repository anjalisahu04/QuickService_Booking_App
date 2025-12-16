import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Alert } from 'react-bootstrap';

const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  let user = null;
  const userString = localStorage.getItem('user');

  if (userString) {
    user = JSON.parse(userString);
  }

  if (user && user.role === 'ADMIN') {
    return children;
  }


  if (user) {
    return (
      <div className="container mt-5">
        <Alert variant="danger">
          <h4>Access Denied</h4>
          <p>You do not have permission to view this page.</p>
        </Alert>
      </div>
    );
  }
  

  return <Navigate to="/auth" state={{ from: location }} replace />;
};

export default ProtectedRoute;