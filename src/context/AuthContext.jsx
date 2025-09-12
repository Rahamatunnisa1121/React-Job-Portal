
import { createContext, useContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in on app load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // In a real app, you'd check with the server using a token
        // For now, we'll check if there's a stored user session
        const savedUser = sessionStorage.getItem('currentUser');
        if (savedUser) {
          const userData = JSON.parse(savedUser);
          // Verify user still exists in database
          const response = await fetch(`/api/users/${userData.id}`);
          if (response.ok) {
            const user = await response.json();
            setUser(user);
          } else {
            // User no longer exists, clear session
            sessionStorage.removeItem('currentUser');
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        sessionStorage.removeItem('currentUser');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      setLoading(true);
      
      // Fetch all users to find matching credentials
      const response = await fetch('/api/users');
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      
      const users = await response.json();
      const foundUser = users.find(u => u.email === email && u.password === password && u.isActive);
      
      if (foundUser) {
        // Don't store password in user object
        const userWithoutPassword = { ...foundUser };
        delete userWithoutPassword.password;
        
        setUser(userWithoutPassword);
        sessionStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
        return { success: true };
      } else {
        return { success: false, error: 'Invalid email or password' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Login failed. Please try again.' };
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      setLoading(true);
      
      // Check if user already exists
      const response = await fetch('/api/users');
      const users = await response.json();
      
      const existingUser = users.find(u => u.email === userData.email);
      if (existingUser) {
        return { success: false, error: 'User with this email already exists' };
      }

      // Create new user
      const newUser = {
        id: Date.now().toString(),
        email: userData.email,
        password: userData.password,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role,
        company: userData.company || null,
        // Add skills field for developers
        skills: userData.role === 'developer' ? userData.skills || [] : undefined,
        createdAt: new Date().toISOString(),
        isActive: true
      };

      // Remove skills field if not a developer
      if (userData.role !== 'developer') {
        delete newUser.skills;
      }

      // Add user to database
      const createResponse = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newUser),
      });

      if (!createResponse.ok) {
        throw new Error('Failed to create user');
      }

      // Login the user immediately after registration
      const userWithoutPassword = { ...newUser };
      delete userWithoutPassword.password;
      
      setUser(userWithoutPassword);
      sessionStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
      
      return { success: true };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: 'Registration failed. Please try again.' };
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    setUser(null);
    sessionStorage.removeItem('currentUser');
  };

  // Check if user has specific role
  const hasRole = (role) => {
    return user && user.role === role;
  };

  // Check if user has any of the specified roles
  const hasAnyRole = (roles) => {
    return user && roles.includes(user.role);
  };

  // Check if user is authenticated
  const isAuthenticated = () => {
    return user !== null;
  };

  // Get all users (admin only)
  const getAllUsers = async () => {
    if (!hasRole('admin')) return [];
    
    try {
      const response = await fetch('/api/users');
      if (response.ok) {
        const users = await response.json();
        return users.map(user => {
          const { password, ...userWithoutPassword } = user;
          return userWithoutPassword;
        });
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
    
    return [];
  };

  // Update user profile
  const updateProfile = async (updatedData) => {
    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...user, ...updatedData }),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        const userWithoutPassword = { ...updatedUser };
        delete userWithoutPassword.password;
        
        setUser(userWithoutPassword);
        sessionStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
        
        return { success: true };
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      return { success: false, error: 'Profile update failed' };
    }
  };

  // Get available skills
  const getSkills = async () => {
    try {
      const response = await fetch('/api/skills');
      if (response.ok) {
        const data = await response.json();
        return data.skills || data;
      }
      
      // Fallback to static skills data from your JSON
      return [
        { id: 1, name: "JavaScript", category: "Programming Language" },
        { id: 2, name: "React", category: "Frontend Framework" },
        { id: 3, name: "Node.js", category: "Backend Technology" },
        { id: 4, name: "Python", category: "Programming Language" },
        { id: 5, name: "Java", category: "Programming Language" },
        { id: 6, name: "SQL", category: "Database" }
      ];
    } catch (error) {
      console.error('Failed to fetch skills:', error);
      // Return fallback skills
      return [
        { id: 1, name: "JavaScript", category: "Programming Language" },
        { id: 2, name: "React", category: "Frontend Framework" },
        { id: 3, name: "Node.js", category: "Backend Technology" },
        { id: 4, name: "Python", category: "Programming Language" },
        { id: 5, name: "Java", category: "Programming Language" },
        { id: 6, name: "SQL", category: "Database" }
      ];
    }
  };

  const value = {
    user,
    login,
    register,
    logout,
    hasRole,
    hasAnyRole,
    isAuthenticated,
    loading,
    getAllUsers,
    updateProfile,
    getSkills
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
