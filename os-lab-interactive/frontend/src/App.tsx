import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./components/Navbar";
import { AuthContextProvider } from "./integrations/firebase/auth/AuthContext";
import { ThemeContextProvider, useTheme } from "./hooks/useTheme";
import "./dark.css";

function App() {
  return (
    <ThemeContextProvider>
      <AppWithTheme />
    </ThemeContextProvider>
  );
}

function AppWithTheme() {
  const { theme } = useTheme();

  useEffect(() => {
    document.body.className = theme === "dark" ? "dark-mode" : "";
  }, [theme]);

  return (
    <AuthContextProvider>
      <Navbar />
      <Outlet />
    </AuthContextProvider>
  );
}

export default App;