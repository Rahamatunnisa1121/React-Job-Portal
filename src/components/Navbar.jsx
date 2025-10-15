import { NavLink } from "react-router-dom";
import logo from "../assets/images/logo.png";
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const Navbar = () => {
  const { user, logout, isDeveloper, isEmployer, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const linkClass = ({ isActive }) =>
    isActive
      ? "bg-black text-white hover:bg-gray-900 hover:text-white rounded-md px-3 py-2"
      : "text-white hover:bg-gray-900 hover:text-white rounded-md px-3 py-2";

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-indigo-700 border-b border-indigo-500">
      <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          <div className="flex flex-1 items-center justify-center md:items-stretch md:justify-start">
            <NavLink className="flex flex-shrink-0 items-center mr-4" to="/">
              <img className="h-10 w-auto" src={logo} alt="React Jobs" />
              <span className="hidden md:block text-white text-2xl font-bold ml-2">
                React Jobs
              </span>
            </NavLink>

            {/* Navigation Links - Only show if authenticated */}
            {isAuthenticated && (
              <div className="md:ml-auto">
                <div className="flex space-x-2">
                  <NavLink to="/" className={linkClass}>
                    {isDeveloper() ? "Jobs" : "My Jobs"}
                  </NavLink>

                  {/* Jobs link - visible to all authenticated users */}
                  <NavLink to="/jobs" className={linkClass}>
                    {isDeveloper() ? "Browse Jobs" : "All Jobs"}
                  </NavLink>

                  {/* Add Job - Only visible to employers */}
                  {isEmployer() && (
                    <NavLink to="/add-job" className={linkClass}>
                      Add Job
                    </NavLink>
                  )}
                  {isDeveloper() && (
                    <NavLink to="/myapplications" className={linkClass}>
                      My applications
                    </NavLink>
                  )}
                  {isDeveloper() && (
                    <NavLink to="/recommendations" className={linkClass}>
                      Job Recommendations
                    </NavLink>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Info and Authentication */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                {/* User welcome message */}
                <div className="text-white text-sm">
                  <span className="hidden sm:inline">Welcome, </span>
                  {/* <span className="font-semibold">{user.name}</span> */}
                  <NavLink to="/profile" className={linkClass}>
                    <span className="font-semibold">{user.name}</span>
                  </NavLink>
                  <span className="ml-1 text-xs bg-indigo-500 px-2 py-1 rounded-full">
                    {user.role}
                  </span>
                </div>

                {/* Logout button */}
                <button
                  onClick={handleLogout}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition-colors duration-200"
                >
                  Logout
                </button>
              </>
            ) : (
              /* Login link for non-authenticated users */
              <Link
                to="/login"
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded transition-colors duration-200"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
