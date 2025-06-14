import { Route, Routes, Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import Home from "@/pages/Home";
import Crew from "@/pages/Crew";
import Shipping from "@/pages/Shipping";
import Login from "@/pages/Login";
import Menu from "./pages/Menu";
import { Bid } from "./pages/Bid";
import CurrentMenu from "./pages/CurrentMenu";

function AppRoutes() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-dashed rounded-full animate-spin" />
          <p className="text-gray-600 text-lg font-medium">Loading...</p>
        </div>
      </div>
    );
  }

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
        element={isAuthenticated ? <Menu /> : <Navigate to="/login" />}
      />
      <Route
        path="/current"
        element={isAuthenticated ? <CurrentMenu /> : <Navigate to="/login" />}
      />
      <Route
        path="/bid"
        element={isAuthenticated ? <Bid /> : <Navigate to="/login" />}
      />
    </Routes>
  );
}

export default AppRoutes;
