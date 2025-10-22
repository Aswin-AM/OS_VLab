import { useContext } from "react";
import { getAuth, signOut } from "firebase/auth";
import { app } from "../../integrations/firebase/client";
import { AuthContext } from "../../integrations/firebase/auth/AuthContext";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    const auth = getAuth(app);
    try {
      await signOut(auth);
      navigate("/auth/login");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <h2>Profile</h2>
      {currentUser && <p>Welcome, {currentUser.email}</p>}
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default Profile;