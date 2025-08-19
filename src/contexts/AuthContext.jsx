
import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const USER_ROLES = {
  DEVELOPER: "developer",
  EMPLOYER: "employer",
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const savedUser = localStorage.getItem("currentUser");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      // Fetch users from your JSON server
      const response = await fetch("http://localhost:8000/users");
      const users = await response.json();

      // Find user with matching credentials
      const foundUser = users.find(
        (u) => u.email === email && u.password === password
      );

      if (foundUser) {
        const userWithoutPassword = { ...foundUser };
        delete userWithoutPassword.password; // Don't store password in state

        setUser(userWithoutPassword);
        localStorage.setItem(
          "currentUser",
          JSON.stringify(userWithoutPassword)
        );
        return { success: true };
      } else {
        return { success: false, error: "Invalid email or password" };
      }
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, error: "Login failed. Please try again." };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("currentUser");
  };

  const isDeveloper = () => user?.role === USER_ROLES.DEVELOPER;
  const isEmployer = () => user?.role === USER_ROLES.EMPLOYER;
  const canEditJob = (job) => isEmployer() && job.employerId === user?.id;

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        logout,
        isDeveloper,
        isEmployer,
        canEditJob,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
