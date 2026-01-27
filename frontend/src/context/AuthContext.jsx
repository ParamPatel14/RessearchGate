import { createContext, useContext, useState, useEffect } from "react";
import { login as apiLogin, register as apiRegister, getMe } from "../api";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        // Check if token is expired
        if (decoded.exp * 1000 < Date.now()) {
          logout();
        } else {
          const userData = await getMe();
          setUser(userData);
        }
      } catch (error) {
        console.error("Failed to fetch user", error);
        logout();
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const login = async (email, password) => {
    const data = await apiLogin(email, password);
    localStorage.setItem("token", data.access_token);
    await fetchUser();
  };

  const register = async (email, password, name, role) => {
    await apiRegister(email, password, name, role);
    // Automatically login after register or redirect to login? 
    // For now, let's just return and let component handle redirect to login
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  const handleOAuthCallback = (token) => {
    localStorage.setItem("token", token);
    fetchUser();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        handleOAuthCallback,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
