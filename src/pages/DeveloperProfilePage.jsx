import React, { useEffect, useState, useContext } from "react";
import "./DeveloperProfilePage.css";
import { AuthContext } from "../context/AuthContext";

// JSON server for skills
const JSON_API = "http://localhost:8000";
// Django backend for profile
const DJANGO_API = "http://localhost:9000/api";

const DeveloperProfilePage = () => {
  const { user } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [about, setAbout] = useState("");
  const [skills, setSkills] = useState([]);
  const [allSkills, setAllSkills] = useState([]);
  const [resume, setResume] = useState(null);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [introVideo, setIntroVideo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  // Fetch skills from JSON server
  useEffect(() => {
    fetch(`${JSON_API}/skills`)
      .then(res => res.json())
      .then(data => setAllSkills(data));
  }, []);

  // Fetch developer profile from Django
  useEffect(() => {
    if (!user?.id) return;
    fetch(`${DJANGO_API}/developers/${user.id}/`)
      .then(res => res.json())
      .then(data => {
        setProfile(data);
        setAbout(data.about || "");
        setSkills(data.skills ? data.skills.map(s => s.id) : []);
      });
  }, [user]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSuccessMsg(""); // Clear previous message
    setLoading(true);
    const formData = new FormData();
    formData.append("about", about);
    skills.forEach(skillId => formData.append("skills", skillId));
    if (resume) formData.append("resume", resume);
    if (profilePhoto) formData.append("profile_photo", profilePhoto);
    if (introVideo) formData.append("intro_video", introVideo);

    try {
      const res = await fetch(`${DJANGO_API}/developers/${user.id}/`, {
        method: "PATCH",
        body: formData,
      });
      if (res.ok) {
        setSuccessMsg("Profile saved successfully!");
        const updatedProfile = await res.json();
        setProfile(updatedProfile);
      } else {
        setSuccessMsg("Failed to save profile.");
      }
    } catch (err) {
      setSuccessMsg("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!profile) return <div style={{ padding: "2rem", textAlign: "center" }}>Loading profile...</div>;

  return (
    <div className="profile-container">
      {/* Profile Header */}
      <div className="profile-header">
        <img
          src={profile.profile_photo ? `http://localhost:9000${profile.profile_photo}` : "https://via.placeholder.com/120"}
          alt="Profile"
          className="profile-photo"
        />
        <div className="profile-info">
          <h2 className="profile-name">{profile.first_name} {profile.last_name}</h2>
          <p className="profile-headline">Full Stack Developer | React | Node.js</p>
          <p className="profile-location">📍 Hyderabad, India</p>
        </div>
      </div>

      <form onSubmit={handleUpdate}>
        {/* Upload Resume */}
        <div className="profile-section">
          <label className="profile-label">Upload Resume</label>
          <input type="file" accept=".pdf,.doc,.docx" className="profile-input" onChange={e => setResume(e.target.files[0])} />
          {profile.resume && (
            <a href={`${DJANGO_API.replace('/api','')}${profile.resume}`} target="_blank" rel="noopener noreferrer" style={{ display: "block", marginTop: 8, color: "#4338ca" }}>View Resume</a>
          )}
        </div>

        {/* Intro Video */}
        <div className="profile-section">
          <label className="profile-label">Intro Video</label>
          <input type="file" accept="video/*" className="profile-input" onChange={e => setIntroVideo(e.target.files[0])} />
          {profile.intro_video && (
            <video src={`${DJANGO_API.replace('/api','')}${profile.intro_video}`} controls width="320" style={{ marginTop: 12, borderRadius: 8 }} />
          )}
        </div>

        {/* Skills */}
        <div className="profile-section">
          <label className="profile-label">Skills</label>
          <select multiple value={skills} onChange={e => setSkills(Array.from(e.target.selectedOptions, opt => parseInt(opt.value)))} className="profile-input">
            {allSkills.map(skill => (
              <option key={skill.id} value={skill.id}>{skill.name}</option>
            ))}
          </select>
          <div className="skills-tags" style={{ marginTop: 8 }}>
            {profile.skills && profile.skills.length > 0
              ? profile.skills.map(skill => (
                  <span key={skill.id} className="skill-tag">{skill.name}</span>
                ))
              : <span className="skill-tag">No skills added yet</span>
            }
            <span className="skill-tag add-skill">+ Add Skill</span>
          </div>
        </div>

        {/* About */}
        <div className="profile-section">
          <label className="profile-label">About Me</label>
          <textarea
            className="profile-textarea"
            rows={4}
            value={about}
            onChange={e => setAbout(e.target.value)}
            placeholder="Write a short bio about your work, experience, and goals..."
          />
        </div>

        {/* Profile Photo */}
        <div className="profile-section">
          <label className="profile-label">Profile Photo</label>
          <input type="file" accept="image/*" onChange={e => setProfilePhoto(e.target.files[0])} />
        </div>

        {/* Projects (static for now) */}
        <div className="profile-section">
          <label className="profile-label">Projects</label>
          <div className="project-card">
            <h4>Autism Detection Tool</h4>
            <p>
              Built using Deep Learning (CNN) for early autism spectrum disorder
              detection. <a href="#">GitHub</a>
            </p>
          </div>
          <div className="project-card">
            <h4>Mass Mailing Application</h4>
            <p>
              Flask + MySQL based email campaign tool integrated with Gmail/Outlook.
              <a href="#">GitHub</a>
            </p>
          </div>
        </div>

        {successMsg && (
          <div style={{
            background: "#e0ffe0",
            color: "#1a7f37",
            padding: "12px",
            borderRadius: "8px",
            marginBottom: "16px",
            textAlign: "center",
            fontWeight: "600"
          }}>
            {successMsg}
          </div>
        )}

        <button className="profile-btn" type="submit" disabled={loading}>
          {loading ? "Saving..." : "Save & Update Profile"}
        </button>
      </form>
    </div>
  );
};

export default DeveloperProfilePage;