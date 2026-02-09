import { createContext, useContext, useState } from "react";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem("token");
    if (!token) return null;
    
    try {
      const decoded = jwtDecode(token);
      
      // DEBUG: Log the decoded token to see what claims exist
      console.log('Decoded JWT:', decoded);
      
      // ASP.NET Core uses long claim names by default
      // Try different possible claim names for role and userId
      const role = decoded.role 
        || decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"]
        || decoded["role"];
      
      const userId = decoded.sub 
        || decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"]
        || decoded.nameid
        || decoded.userId;
      
      return {
        token,
        role: role,
        userId: userId
      };
    } catch {
      return null;
    }
  });

  const login = (token) => {
    const decoded = jwtDecode(token);
    
    // DEBUG: Log what we're decoding
    console.log('Login - Decoded JWT:', decoded);
    
    // Use same logic as above
    const role = decoded.role 
      || decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"]
      || decoded["role"];
    
    const userId = decoded.sub 
      || decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"]
      || decoded.nameid
      || decoded.userId;
    
    localStorage.setItem("token", token);
    setUser({
      token,
      role: role,
      userId: userId
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