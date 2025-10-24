import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const USER_ROLES = {
  DEVELOPER: "developer",
  EMPLOYER: "employer",
  COMPANY: "company",
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
      // First, try to login as a regular user (developer/employer)
      const usersResponse = await fetch("http://localhost:8000/users");
      const users = await usersResponse.json();

      const foundUser = users.find(
        (u) => u.email === email && u.password === password
      );

      if (foundUser) {
        const userWithoutPassword = { ...foundUser };
        delete userWithoutPassword.password;

        setUser(userWithoutPassword);
        localStorage.setItem(
          "currentUser",
          JSON.stringify(userWithoutPassword)
        );
        return { success: true };
      }

      // If not found in users, try companies API
      const companiesResponse = await fetch("http://localhost:8000/companies");
      const companies = await companiesResponse.json();

      const foundCompany = companies.find(
        (c) => c.email === email && c.password === password
      );

      if (foundCompany) {
        // Add role property to company object
        const companyWithoutPassword = {
          ...foundCompany,
          role: "company", // Add role to identify as company
        };
        delete companyWithoutPassword.password;

        setUser(companyWithoutPassword);
        localStorage.setItem(
          "currentUser",
          JSON.stringify(companyWithoutPassword)
        );
        return { success: true };
      }

      //company employees
      const EmployerResponse = await fetch("http://localhost:8000/employers");
      const employers = await EmployerResponse.json();

      const foundEmployer = employers.find(
        (e) => e.email === email && e.password === password
      );

      if (foundEmployer) {
        // Add role property to employer object
        const employerWithoutPassword = {
          ...foundEmployer,
          role: "employer", // Add role to identify as employer
        };
        delete employerWithoutPassword.password;

        setUser(employerWithoutPassword);
        localStorage.setItem(
          "currentUser",
          JSON.stringify(employerWithoutPassword)
        );
        return { success: true };
      }

      if (foundEmployer) {
        // Add role property to employer object
        const employerWithoutPassword = {
          ...foundEmployer,
          role: "employer", // Add role to identify as employer
        };
        delete employerWithoutPassword.password;

        setUser(employerWithoutPassword);
        localStorage.setItem(
          "currentUser",
          JSON.stringify(employerWithoutPassword)
        );
        return { success: true };
      }

      // Neither user nor company found
      return { success: false, error: "Invalid email or password" };
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, error: "Login failed. Please try again." };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("currentUser");
  };

  // Update user data after profile changes
  const updateUser = (updatedUserData) => {
    try {
      const userWithoutPassword = { ...updatedUserData };
      delete userWithoutPassword.password;

      setUser(userWithoutPassword);
      localStorage.setItem("currentUser", JSON.stringify(userWithoutPassword));

      console.log("User updated successfully:", userWithoutPassword);
    } catch (error) {
      console.error("Error updating user data:", error);
    }
  };

  const isDeveloper = () => user?.role === USER_ROLES.DEVELOPER;
  const isEmployer = () => user?.role === USER_ROLES.EMPLOYER;
  const isCompany = () => user?.role === USER_ROLES.COMPANY;
  const canEditJob = (job) => isEmployer() && job.employerId === user?.id;

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        logout,
        updateUser,
        isDeveloper,
        isEmployer,
        isCompany,
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
// File: src/contexts/AuthContext.jsx