import Navbar from './components/Navbar';
import AppRoutes from './AppRoutes';
import { useAuth } from './context/AuthContext';

function App() {
  const { isAuthenticated } = useAuth();
  return (
    <div className="app-container">
      {isAuthenticated && <Navbar />}
      <AppRoutes />
    </div>
  );
}

export default App;
