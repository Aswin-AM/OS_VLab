import { useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../integrations/firebase/auth/AuthContext";
import { useTheme } from "../hooks/useTheme";

const Navbar = () => {
  const { currentUser } = useContext(AuthContext);
  const { theme, toggleTheme } = useTheme();

  return (
    <nav>
      <ul>
        <li>
          <Link to="/">Home</Link>
        </li>
        <li>
          <Link to="/docs">Docs</Link>
        </li>
        <li>
          <Link to="/topics">Topics</Link>
        </li>
        <li>
          <Link to="/progress">Progress</Link>
        </li>
        {currentUser ? (
          <li>
            <Link to="/profile">Profile</Link>
          </li>
        ) : (
          <li>
            <Link to="/auth/login">Login</Link>
          </li>
        )}
      </ul>
      <button onClick={toggleTheme}>
        Switch to {theme === "light" ? "Dark" : "Light"} Mode
      </button>
    </nav>
  );
};

export default Navbar;