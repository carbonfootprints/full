import { Navigate } from 'react-router-dom';

export default function PrivateRoute({ children }) {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role'); // 'admin' or 'user'

  if (!token) {
    return <Navigate to="/auth/login" replace />;
  }

  return React.cloneElement(children, { userRole: role });
}
