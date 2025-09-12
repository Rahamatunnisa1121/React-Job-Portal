import React, { useState, useRef, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/images/logo.png';

const Navbar = () => {
  const { user, logout, isAuthenticated, hasRole } = useAuth();
  const [showProfile, setShowProfile] = useState(false);
  const dropdownRef = useRef();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowProfile(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const linkClass = ({ isActive }) =>
    isActive
      ? 'bg-black text-white hover:bg-gray-900 hover:text-white rounded-md px-3 py-2'
      : 'text-white hover:bg-gray-900 hover:text-white rounded-md px-3 py-2';

  const handleLogout = () => {
    logout();
  };

  return (
    <nav className="bg-indigo-700 border-b border-indigo-500 fixed top-0 w-full z-50">
      <div className='mx-auto max-w-7xl px-2 sm:px-6 lg:px-8'>
        <div className='flex h-20 items-center justify-between'>
          <div className='flex flex-1 items-center justify-center md:items-stretch md:justify-start'>
            <NavLink className='flex flex-shrink-0 items-center mr-4' to='/'>
              <img className='h-10 w-auto' src={logo} alt='React Jobs' />
              <span className='hidden md:block text-white text-2xl font-bold ml-2'>
                React Jobs
              </span>
            </NavLink>
            <div className='md:ml-auto flex items-center space-x-4'>
              <div className='flex space-x-2'>
                {/* Public routes - available to everyone */}
                <NavLink to='/' className={linkClass}>
                  Home
                </NavLink>
                <NavLink to='/jobs' className={linkClass}>
                  Jobs
                </NavLink>

                {/* Routes based on authentication and roles */}
                {isAuthenticated() ? (
                  <>
                    {/* Developer-specific routes */}
                    {hasRole('developer') && (
                      <>
                        <NavLink to='/my-applications' className={linkClass}>
                          My Applications
                        </NavLink>
                        <NavLink to='/saved-jobs' className={linkClass}>
                          Saved Jobs
                        </NavLink>
                      </>
                    )}

                    {/* Employer-specific routes */}
                    {hasRole('employer') && (
                      <>
                        <NavLink to='/add-job' className={linkClass}>
                          Post Job
                        </NavLink>
                        <NavLink to='/my-jobs' className={linkClass}>
                          My Jobs
                        </NavLink>
                        {/* <NavLink to='/applications' className={linkClass}>
                          Applications
                        </NavLink> */}
                      </>
                    )}

                    {/* Admin-specific routes */}
                    {hasRole('admin') && (
                      <>
                        <NavLink to='/admin' className={linkClass}>
                          Admin Panel
                        </NavLink>
                        <NavLink to='/manage-users' className={linkClass}>
                          Manage Users
                        </NavLink>
                        <NavLink to='/add-job' className={linkClass}>
                          Add Job
                        </NavLink>
                      </>
                    )}

                    {/* User menu */}
                    <div className='relative flex items-center space-x-2'>
                      {/* Make name/role clickable */}
                      <button
                        className='text-white text-sm font-semibold focus:outline-none'
                        onClick={() => setShowProfile((prev) => !prev)}
                        style={{ cursor: 'pointer' }}
                      >
                        Hi, {user?.firstName}
                      </button>
                      {/* Profile dropdown (improved design) */}
                      {showProfile && (
                        <div
                          ref={dropdownRef}
                          className="absolute top-12 right-0 bg-white rounded-xl shadow-lg p-6 min-w-[340px] z-50 border border-indigo-100"
                          style={{ fontFamily: 'Segoe UI, Roboto, Arial, sans-serif' }}
                        >
                          <div className="flex items-center mb-4">
                            <div className="w-16 h-16 rounded-full bg-indigo-200 flex items-center justify-center text-indigo-700 font-bold text-3xl mr-4">
                              {user?.firstName?.[0]}
                            </div>
                            <div>
                              <div className="font-semibold text-indigo-700 text-xl mb-1">
                                {user?.firstName} {user?.lastName}
                              </div>
                              <div className="text-xs text-gray-500">{user?.email}</div>
                            </div>
                          </div>
                          {user?.role === 'developer' && user?.skills?.length > 0 && (
                            <div className="mb-3">
                              <div className="text-xs text-gray-600 mb-1">Skills:</div>
                              <div className="flex flex-wrap gap-2">
                                {user.skills.map(skill =>
                                  <span key={skill.id} className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-medium">
                                    {skill.name}
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                          {user?.role === 'employer' && user?.companyName && (
                            <div className="mb-3 text-xs text-gray-600">
                              <span className="font-medium">Company:</span> {user.companyName}
                            </div>
                          )}
                          {user?.about && (
                            <div className="mb-3 text-xs text-gray-700">
                              <span className="font-semibold">About:</span> {user.about}
                            </div>
                          )}
                          <hr className="my-4 border-gray-200" />
                          <div className="flex gap-2">
                            <NavLink
                              to="/profile"
                              className="flex-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 px-3 py-2 rounded-lg text-sm font-semibold text-center transition"
                              onClick={() => setShowProfile(false)}
                              style={{ border: '1px solid #e0e3f0' }}
                            >
                              Edit Profile
                            </NavLink>
                            <button
                              onClick={handleLogout}
                              className="flex-1 bg-red-50 text-red-600 hover:bg-red-100 px-3 py-2 rounded-lg text-sm font-semibold text-center transition"
                              style={{ border: '1px solid #f0d0d0' }}
                            >
                              Logout
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    {/* Authentication routes for non-logged-in users */}
                    <NavLink to='/login' className={linkClass}>
                      Login
                    </NavLink>
                    <NavLink to='/register' className={linkClass}>
                      Register
                    </NavLink>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;