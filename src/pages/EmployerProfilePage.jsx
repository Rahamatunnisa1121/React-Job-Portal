import React from 'react';
import './EmployerProfilePage.css';

const EmployerProfilePage = () => (
  <div className="employer-profile-card">
    <div className="employer-profile-title">Company Profile</div>

    {/* Company logo upload */}
    <div>
      <label className="employer-profile-label">Company Logo</label>
      <input type="file" accept="image/*" className="employer-profile-input" />
    </div>

    {/* Company name */}
    <div>
      <label className="employer-profile-label">Company Name</label>
      <input
        type="text"
        className="employer-profile-input"
        placeholder="Enter your company name"
      />
    </div>

    {/* Company description */}
    <div>
      <label className="employer-profile-label">Company Description</label>
      <textarea
        className="employer-profile-textarea"
        rows={4}
        placeholder="Describe your company, mission, and work culture..."
      />
    </div>

    <button className="employer-profile-btn">Update Profile</button>
  </div>
);

export default EmployerProfilePage;
