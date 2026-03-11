import { createContext, useContext, useState } from "react";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem("token");
    if (!token) return null;

    try {
      const decoded = jwtDecode(token);
      return {
        token,
        role: decoded.role || decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"],
        userId: decoded.sub || decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"]
      };
    } catch {
      return null;
    }
  });

  const login = (token) => {
    const decoded = jwtDecode(token);
    
    localStorage.setItem("token", token);
    setUser({
      token,
      role: decoded.role || decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"],
      userId: decoded.sub || decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"]
    });
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);