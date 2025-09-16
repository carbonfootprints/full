// src/components/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // if route has role restriction
  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/pages/maintenance/error" replace />;
  }

  return children;
};

export default ProtectedRoute;
