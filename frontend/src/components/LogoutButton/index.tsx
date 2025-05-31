import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { useAuth } from "@/context/AuthContext";

const LogoutButton = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  return (
    <Button
      onClick={() => {
        logout();
        navigate("/login");
      }}
    >
      Logout
    </Button>
  );
};

export default LogoutButton;
