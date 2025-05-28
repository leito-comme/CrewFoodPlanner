import { Route, Routes, Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Home from '@/pages/Home';
import Crew from '@/pages/Crew';
import Shipping from '@/pages/Shipping';
import Login from '@/pages/Login';

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        path="/"
        element={isAuthenticated ? <Home /> : <Navigate to="/login" />}
      />
      <Route
        path="/crew"
        element={isAuthenticated ? <Crew /> : <Navigate to="/login" />}
      />
      <Route
        path="/shipping"
        element={isAuthenticated ? <Shipping /> : <Navigate to="/login" />}
      />
      <Route
        path="/menu"
        element={isAuthenticated ? <div>Menu</div> : <Navigate to="/login" />}
      />
      <Route
        path="/flow"
        element={isAuthenticated ? <div>Flow</div> : <Navigate to="/login" />}
      />
      <Route
        path="/analytics"
        element={isAuthenticated ? <div>Analytics</div> : <Navigate to="/login" />}
      />
    </Routes>
  );
}

export default AppRoutes;
