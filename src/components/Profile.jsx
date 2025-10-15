// src/components/Profile.jsx
import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Navigate } from "react-router-dom";
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Briefcase,
  Code,
  Save,
  X,
  AlertCircle,
  Loader2,
  CheckCircle,
  Edit3,
  Building,
  Camera,
  Upload,
  Video,
  Image,
  Trash2,
  Play,
  FileText,
  Download,
} from "lucide-react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";



// AWS SDK v3 Configuration using environment variables
const s3Client = new S3Client({
  region: import.meta.env.VITE_AWS_REGION,
  credentials: {
    accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID,
    secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY,
  },
  logger: console,
  maxAttempts: 1,
});
const BUCKET_NAME = import.meta.env.VITE_AWS_S3_BUCKET_NAME;
const S3_BASE_URL = import.meta.env.VITE_AWS_S3_BASE_URL;
const YOUR_NAME = import.meta.env.VITE_YOUR_NAME;

const Profile = () => {
  const { user, isAuthenticated, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [availableSkills, setAvailableSkills] = useState([]);
  const [skillsLoading, setSkillsLoading] = useState(false);
  const [newSkillName, setNewSkillName] = useState("");
  const [isAddingSkill, setIsAddingSkill] = useState(false);
  const [jobsCount, setJobsCount] = useState(0);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState("");
  const [introVideo, setIntroVideo] = useState(null);
  const [introVideoPreview, setIntroVideoPreview] = useState("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const resumeInputRef = useRef(null);
  const [resume, setResume] = useState(null);
  const [resumeFileName, setResumeFileName] = useState("");
  const [isUploadingResume, setIsUploadingResume] = useState(false);

  // ✅ Modal states
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);

  //draft states
  const [hasDraft, setHasDraft] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [draftData, setDraftData] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
    skills: [],
    profileImageUrl: "",
    introVideoUrl: "",
    resumeUrl: "",
    aboutMe: "",
  });

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // ✅ Close modal on ESC key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") {
        setShowResumeModal(false);
        setShowVideoModal(false);
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  // ✅ Modal functions
  const openResumeModal = () => {
    setShowResumeModal(true);
    document.body.style.overflow = "hidden";
  };

  const closeResumeModal = () => {
    setShowResumeModal(false);
    document.body.style.overflow = "auto";
  };

  const openVideoModal = () => {
    setShowVideoModal(true);
    document.body.style.overflow = "hidden";
  };

  const closeVideoModal = () => {
    setShowVideoModal(false);
    document.body.style.overflow = "auto";
  };

useEffect(() => {
  if (user) {
    // Check if user has draft data
    const hasSavedDraft = user.draft && Object.keys(user.draft).length > 0;
    setHasDraft(hasSavedDraft);
    setDraftData(user.draft);

    // Load either draft or published data when editing
    const dataToLoad = hasSavedDraft && isEditing ? user.draft : user;

    setFormData({
      name: dataToLoad.name || "",
      email: dataToLoad.email || "",
      password: "",
      confirmPassword: "",
      role: dataToLoad.role || user.role || "",
      skills: dataToLoad.skills || [],
      profileImageUrl: dataToLoad.profileImageUrl || "",
      introVideoUrl: dataToLoad.introVideoUrl || "",
      resumeUrl: dataToLoad.resumeUrl || "",
      aboutMe: dataToLoad.aboutMe || "",
    });

    // Set preview images from draft or published
    if (user.role === "developer" && dataToLoad.profileImageUrl) {
      setProfileImagePreview(dataToLoad.profileImageUrl);
    } else if (
      user.role === "employer" &&
      (dataToLoad.companyPhoto || user.companyPhoto)
    ) {
      setProfileImagePreview(dataToLoad.companyPhoto || user.companyPhoto);
    }

    if (dataToLoad.introVideoUrl) {
      setIntroVideoPreview(dataToLoad.introVideoUrl);
    }
    if (dataToLoad.resumeUrl) {
      setResumeFileName(dataToLoad.resumeUrl.split("/").pop());
    }
  }

  if (user?.role === "developer") {
    fetchSkills();
  } else if (user?.role === "employer") {
    fetchJobsCount();
  }
}, [user, isEditing]);

  const fetchSkills = async () => {
    setSkillsLoading(true);
    try {
      const response = await fetch("/api/skills");
      if (!response.ok) throw new Error("Failed to fetch skills");
      const skills = await response.json();
      setAvailableSkills(skills);
    } catch (error) {
      console.error("Error fetching skills:", error);
      setMessage({ type: "error", text: "Failed to load skills" });
    } finally {
      setSkillsLoading(false);
    }
  };

  // New function: Save as Draft
const handleSaveAsDraft = async () => {
  setIsSavingDraft(true);
  setMessage({ type: "", text: "" });

  try {
    let profileImageUrl = formData.profileImageUrl;
    let introVideoUrl = formData.introVideoUrl;
    let resumeUrl = formData.resumeUrl;

    // Upload files if new ones are selected
    if (profileImage) {
      try {
        profileImageUrl = await uploadProfileImage();
      } catch (error) {
        setIsSavingDraft(false);
        return;
      }
    }

    if (introVideo && formData.role === "developer") {
      try {
        introVideoUrl = await uploadIntroVideo();
      } catch (error) {
        setIsSavingDraft(false);
        return;
      }
    }

    if (resume && formData.role === "developer") {
      try {
        resumeUrl = await uploadResume();
      } catch (error) {
        setIsSavingDraft(false);
        return;
      }
    }

    // Prepare draft data object
    const draftObject = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      role: formData.role,
    };

    // Add password only if changed
    if (formData.password && formData.password.trim()) {
      draftObject.password = formData.password;
    }

    // Add role-specific fields
    if (formData.role === "developer") {
      draftObject.skills = formData.skills;
      draftObject.profileImageUrl = profileImageUrl;
      draftObject.introVideoUrl = introVideoUrl;
      draftObject.resumeUrl = resumeUrl;
      draftObject.aboutMe = formData.aboutMe;
    }
    if (formData.role === "employer") {
      draftObject.companyPhoto = profileImageUrl;
      draftObject.aboutMe = formData.aboutMe;
    }

    // First, get the current user data
    const getCurrentUser = await fetch(`/api/users/${user.id}`);
    if (!getCurrentUser.ok) throw new Error("Failed to fetch current user");
    const currentUser = await getCurrentUser.json();

    // Update user with draft data using PATCH
    const response = await fetch(`/api/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...currentUser, // Keep all existing fields
        draft: draftObject, // Add/update draft
      }),
    });

    if (!response.ok) throw new Error("Failed to save draft");
    const updatedUser = await response.json();

    // Update local user context with draft
    updateUser(updatedUser);
    setHasDraft(true);
    setDraftData(updatedUser.draft);

    // Clear file inputs but keep form data
    setProfileImage(null);
    setIntroVideo(null);
    setResume(null);

    // Update previews
    setProfileImagePreview(profileImageUrl || "");
    setIntroVideoPreview(introVideoUrl || "");
    if (resumeUrl) setResumeFileName(resumeUrl.split("/").pop());

    setMessage({
      type: "success",
      text: "✅ Draft saved successfully! Your changes are not yet visible to others.",
    });
  } catch (error) {
    console.error("Error saving draft:", error);
    setMessage({
      type: "error",
      text: "Failed to save draft. Please try again.",
    });
  } finally {
    setIsSavingDraft(false);
  }
};

  // New function: Discard Draft
const handleDiscardDraft = async () => {
  if (
    !window.confirm(
      "Are you sure you want to discard your draft? This cannot be undone."
    )
  ) {
    return;
  }

  try {
    // Get current user data
    const getCurrentUser = await fetch(`/api/users/${user.id}`);
    if (!getCurrentUser.ok) throw new Error("Failed to fetch current user");
    const currentUser = await getCurrentUser.json();

    // Remove draft field
    const { draft, ...userWithoutDraft } = currentUser;

    // Update user without draft
    const response = await fetch(`/api/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userWithoutDraft),
    });

    if (!response.ok) throw new Error("Failed to discard draft");
    const updatedUser = await response.json();

    updateUser(updatedUser);
    setHasDraft(false);
    setDraftData(null);

    // Reset form to published data
    setFormData({
      name: user.name || "",
      email: user.email || "",
      password: "",
      confirmPassword: "",
      role: user.role || "",
      skills: user.skills || [],
      profileImageUrl: user.profileImageUrl || "",
      introVideoUrl: user.introVideoUrl || "",
      resumeUrl: user.resumeUrl || "",
      aboutMe: user.aboutMe || "",
    });

    setProfileImage(null);
    setIntroVideo(null);
    setResume(null);
    setProfileImagePreview(user.profileImageUrl || user.companyPhoto || "");
    setIntroVideoPreview(user.introVideoUrl || "");
    setResumeFileName(user.resumeUrl ? user.resumeUrl.split("/").pop() : "");

    setMessage({ type: "success", text: "Draft discarded successfully!" });
  } catch (error) {
    console.error("Error discarding draft:", error);
    setMessage({
      type: "error",
      text: "Failed to discard draft. Please try again.",
    });
  }
};

    const handleSave = async () => {
      const validationError = validateForm();
      if (validationError) {
        setMessage({ type: "error", text: validationError });
        return;
      }

      setIsSaving(true);
      setMessage({ type: "", text: "" });

      try {
        let profileImageUrl = formData.profileImageUrl;
        let introVideoUrl = formData.introVideoUrl;
        let resumeUrl = formData.resumeUrl;

        if (profileImage) {
          try {
            profileImageUrl = await uploadProfileImage();
          } catch (error) {
            setIsSaving(false);
            return;
          }
        }

        if (introVideo && formData.role === "developer") {
          try {
            introVideoUrl = await uploadIntroVideo();
          } catch (error) {
            setIsSaving(false);
            return;
          }
        }

        if (resume && formData.role === "developer") {
          try {
            resumeUrl = await uploadResume();
          } catch (error) {
            setIsSaving(false);
            return;
          }
        }

        // Get current user data first
        const getCurrentUser = await fetch(`/api/users/${user.id}`);
        if (!getCurrentUser.ok) throw new Error("Failed to fetch current user");
        const currentUser = await getCurrentUser.json();

        const updateData = {
          ...currentUser,
          name: formData.name.trim(),
          email: formData.email.trim(),
          role: formData.role,
        };

        // Remove draft field (publish changes)
        delete updateData.draft;

        if (formData.password && formData.password.trim()) {
          updateData.password = formData.password;
        }

        if (formData.role === "developer") {
          updateData.skills = formData.skills;
          updateData.profileImageUrl = profileImageUrl;
          updateData.introVideoUrl = introVideoUrl;
          updateData.resumeUrl = resumeUrl;
          updateData.aboutMe = formData.aboutMe;
        }
        if (formData.role === "employer") {
          updateData.companyPhoto = profileImageUrl;
          updateData.aboutMe = formData.aboutMe;
        }

        const response = await fetch(`/api/users/${user.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updateData),
        });

        if (!response.ok) throw new Error("Failed to update profile");
        const updatedUser = await response.json();

        updateUser(updatedUser);
        setHasDraft(false);
        setDraftData(null);

        setFormData((prev) => ({
          ...prev,
          profileImageUrl: profileImageUrl,
          introVideoUrl: introVideoUrl,
          resumeUrl: resumeUrl,
          aboutMe: formData.aboutMe,
          password: "",
          confirmPassword: "",
        }));

        setProfileImage(null);
        setIntroVideo(null);
        setResume(null);

        setProfileImagePreview(profileImageUrl || "");
        setIntroVideoPreview(introVideoUrl || "");
        if (resumeUrl) setResumeFileName(resumeUrl.split("/").pop());

        setMessage({
          type: "success",
          text: "✨ Profile published successfully!",
        });
        setIsEditing(false);
      } catch (error) {
        console.error("Error updating profile:", error);
        setMessage({
          type: "error",
          text: "Failed to update profile. Please try again.",
        });
      } finally {
        setIsSaving(false);
      }
    };

  const fetchJobsCount = async () => {
    setJobsLoading(true);
    try {
      const response = await fetch("/api/jobs");
      if (!response.ok) throw new Error("Failed to fetch jobs");
      const jobs = await response.json();
      const employerJobs = jobs.filter((job) => job.employerId === user.id);
      setJobsCount(employerJobs.length);
    } catch (error) {
      console.error("Error fetching jobs count:", error);
      setJobsCount(0);
    } finally {
      setJobsLoading(false);
    }
  };

  const handleAddSkill = async () => {
    if (!newSkillName.trim()) {
      setMessage({ type: "error", text: "Please enter a skill name" });
      return;
    }

    const existingSkill = availableSkills.find(
      (skill) => skill.name.toLowerCase() === newSkillName.trim().toLowerCase()
    );

    if (existingSkill) {
      setMessage({ type: "error", text: "This skill already exists" });
      return;
    }

    setIsAddingSkill(true);
    try {
      const response = await fetch("/api/skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newSkillName.trim(),
          id: Date.now().toString(),
        }),
      });

      if (!response.ok) throw new Error("Failed to add skill");
      const newSkill = await response.json();

      setAvailableSkills((prev) => [...prev, newSkill]);
      setFormData((prev) => ({
        ...prev,
        skills: [...prev.skills, newSkill.id],
      }));

      setNewSkillName("");
      setMessage({
        type: "success",
        text: `Skill "${newSkill.name}" added successfully!`,
      });
    } catch (error) {
      console.error("Error adding skill:", error);
      setMessage({
        type: "error",
        text: "Failed to add skill. Please try again.",
      });
    } finally {
      setIsAddingSkill(false);
    }
  };

  const handleDeleteSkill = async (skillId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this skill? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/skills/${skillId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete skill");

      setAvailableSkills((prev) =>
        prev.filter((skill) => skill.id !== skillId)
      );
      setFormData((prev) => ({
        ...prev,
        skills: prev.skills.filter((id) => id !== skillId),
      }));

      setMessage({ type: "success", text: "Skill deleted successfully!" });
    } catch (error) {
      console.error("Error deleting skill:", error);
      setMessage({
        type: "error",
        text: "Failed to delete skill. Please try again.",
      });
    }
  };

  const uploadToS3 = async (file, folder) => {
    try {
      const fileExtension = file.name.split(".").pop();
      const timestamp = Date.now();
      const fileName = `${YOUR_NAME}/${folder}/${user.id}_${folder}_${timestamp}.${fileExtension}`;

      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);

      const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: fileName,
        Body: uint8Array,
        ContentType: file.type,
      });

      setUploadProgress(25);
      await new Promise((resolve) => setTimeout(resolve, 500));
      setUploadProgress(50);

      await s3Client.send(command);

      setUploadProgress(75);
      await new Promise((resolve) => setTimeout(resolve, 300));
      setUploadProgress(100);

      const fileUrl = `${S3_BASE_URL}${fileName}`;
      console.log("File uploaded successfully:", fileUrl);
      return fileUrl;
    } catch (error) {
      console.error("Error uploading to S3:", error);
      throw error;
    }
  };

  const deleteFromS3 = async (fileUrl) => {
    try {
      const key = fileUrl.replace(S3_BASE_URL, "");
      const command = new DeleteObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
      });
      await s3Client.send(command);
      console.log("File deleted successfully from S3:", key);
    } catch (error) {
      console.error("Error deleting file from S3:", error);
    }
  };

  const handleImageSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setMessage({ type: "error", text: "Please select a valid image file" });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: "error", text: "Image size must be less than 5MB" });
      return;
    }

    setProfileImage(file);
    const reader = new FileReader();
    reader.onload = (e) => setProfileImagePreview(e.target.result);
    reader.readAsDataURL(file);
  };

  const handleVideoSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("video/")) {
      setMessage({ type: "error", text: "Please select a valid video file" });
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      setMessage({ type: "error", text: "Video size must be less than 50MB" });
      return;
    }

    setIntroVideo(file);
    const reader = new FileReader();
    reader.onload = (e) => setIntroVideoPreview(e.target.result);
    reader.readAsDataURL(file);
  };

  const handleResumeSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!allowedTypes.includes(file.type)) {
      setMessage({
        type: "error",
        text: "Please select a valid resume file (PDF, DOC, DOCX)",
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setMessage({ type: "error", text: "Resume size must be less than 10MB" });
      return;
    }

    setResume(file);
    setResumeFileName(file.name);
  };

  const uploadProfileImage = async () => {
    if (!profileImage) return null;
    setIsUploadingImage(true);
    setUploadProgress(0);
    try {
      const imageUrl = await uploadToS3(profileImage, "profiles");
      setMessage({
        type: "success",
        text: "Profile image uploaded successfully!",
      });
      return imageUrl;
    } catch (error) {
      console.error("Error uploading profile image:", error);
      setMessage({ type: "error", text: "Failed to upload profile image" });
      throw error;
    } finally {
      setIsUploadingImage(false);
      setUploadProgress(0);
    }
  };

  const uploadIntroVideo = async () => {
    if (!introVideo) return null;
    setIsUploadingVideo(true);
    setUploadProgress(0);
    try {
      const videoUrl = await uploadToS3(introVideo, "videos");
      setMessage({
        type: "success",
        text: "Intro video uploaded successfully!",
      });
      return videoUrl;
    } catch (error) {
      console.error("Error uploading intro video:", error);
      setMessage({ type: "error", text: "Failed to upload intro video" });
      throw error;
    } finally {
      setIsUploadingVideo(false);
      setUploadProgress(0);
    }
  };

  const uploadResume = async () => {
    if (!resume) return null;
    setIsUploadingResume(true);
    setUploadProgress(0);
    try {
      const resumeUrl = await uploadToS3(resume, "documents");
      setMessage({ type: "success", text: "Resume uploaded successfully!" });
      return resumeUrl;
    } catch (error) {
      console.error("Error uploading resume:", error);
      setMessage({ type: "error", text: "Failed to upload resume" });
      throw error;
    } finally {
      setIsUploadingResume(false);
      setUploadProgress(0);
    }
  };

  const removeProfileImage = () => {
    setProfileImage(null);
    setProfileImagePreview("");
    setFormData((prev) => ({ ...prev, profileImageUrl: "" }));
  };

  const removeIntroVideo = () => {
    setIntroVideo(null);
    setIntroVideoPreview("");
    setFormData((prev) => ({ ...prev, introVideoUrl: "" }));
  };

  const removeResume = () => {
    setResume(null);
    setResumeFileName("");
    setFormData((prev) => ({ ...prev, resumeUrl: "" }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (message.text) setMessage({ type: "", text: "" });
  };

  const handleSkillToggle = (skillId) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.includes(skillId)
        ? prev.skills.filter((id) => id !== skillId)
        : [...prev.skills, skillId],
    }));
  };

  const removeSkill = (skillId) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((id) => id !== skillId),
    }));
  };

  const getSkillName = (skillId) => {
    const skill = availableSkills.find((s) => String(s.id) === String(skillId));
    return skill ? skill.name : "";
  };

  const validateEmail = (email) => {
    const regex =
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return regex.test(email);
  };

  const validateForm = () => {
    if (!formData.name.trim()) return "Name is required";
    if (!formData.email.trim()) return "Email is required";
    if (!validateEmail(formData.email.trim()))
      return "Please enter a valid email address";

    if (formData.password) {
      if (formData.password.length < 6)
        return "Password must be at least 6 characters long";
      if (formData.password !== formData.confirmPassword)
        return "Passwords do not match";
    }

    if (formData.role === "developer" && formData.skills.length === 0) {
      return "Please select at least one skill";
    }

    return null;
  };

  const handleCancel = () => {
    setFormData({
      name: user.name || "",
      email: user.email || "",
      password: "",
      confirmPassword: "",
      role: user.role || "",
      skills: user.skills || [],
      profileImageUrl: user.profileImageUrl || "",
      introVideoUrl: user.introVideoUrl || "",
      resumeUrl: user.resumeUrl || "",
      aboutMe: user.aboutMe || "",
    });

    setProfileImage(null);
    setIntroVideo(null);
    setResume(null);
    setProfileImagePreview(user.profileImageUrl || "");
    setIntroVideoPreview(user.introVideoUrl || "");
    setResumeFileName(user.resumeUrl ? user.resumeUrl.split("/").pop() : "");

    setIsEditing(false);
    setMessage({ type: "", text: "" });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div
              className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 shadow-lg ${
                user?.role === "developer"
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600"
                  : "bg-gradient-to-r from-purple-600 to-pink-600"
              }`}
            >
              {user?.role === "developer" ? (
                <Code className="w-8 h-8 text-white" />
              ) : (
                <Building className="w-8 h-8 text-white" />
              )}
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {user?.role === "developer" ? "Developer" : "Employer"} Profile
            </h1>
            <p className="text-gray-600">
              {isEditing
                ? "Edit your profile information"
                : "Manage your account details"}
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div
              className={`px-8 py-6 ${
                user?.role === "developer"
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600"
                  : "bg-gradient-to-r from-purple-600 to-pink-600"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="relative w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center overflow-hidden">
                    {(user?.role === "developer" &&
                      (user?.profileImageUrl || profileImagePreview)) ||
                    (user?.role === "employer" &&
                      (user?.companyPhoto || profileImagePreview)) ? (
                      <img
                        src={
                          user?.role === "developer"
                            ? profileImagePreview || user?.profileImageUrl
                            : profileImagePreview || user?.companyPhoto
                        }
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : user?.role === "developer" ? (
                      <User className="w-8 h-8 text-white" />
                    ) : (
                      <Building className="w-8 h-8 text-white" />
                    )}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">
                      {user?.name}
                    </h2>
                    <p className="text-blue-100">{user?.email}</p>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-white bg-opacity-20 text-white mt-1">
                      {user?.role?.charAt(0).toUpperCase() +
                        user?.role?.slice(1)}
                    </span>
                  </div>
                </div>

                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-lg transition-all duration-200"
                  >
                    <Edit3 className="w-4 h-4" />
                    Edit Profile
                  </button>
                )}
              </div>
            </div>

            <div className="p-8">
              {message.text && (
                <div
                  className={`flex items-center gap-2 p-3 mb-6 rounded-lg ${
                    message.type === "success"
                      ? "bg-green-50 border border-green-200 text-green-700"
                      : "bg-red-50 border border-red-200 text-red-700"
                  }`}
                >
                  {message.type === "success" ? (
                    <CheckCircle className="h-5 w-5 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="h-5 w-5 flex-shrink-0" />
                  )}
                  <span className="text-sm">{message.text}</span>
                </div>
              )}

              {isEditing ? (
                <div className="space-y-6">
                  {/* Profile Image Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {formData.role === "developer"
                        ? "Profile Photo"
                        : "Company Logo"}
                    </label>
                    <div className="flex items-center space-x-4">
                      <div className="relative w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center overflow-hidden bg-gray-50">
                        {profileImagePreview ? (
                          <img
                            src={profileImagePreview}
                            alt="Preview"
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <div className="text-center">
                            {formData.role === "developer" ? (
                              <User className="w-8 h-8 text-gray-400 mx-auto mb-1" />
                            ) : (
                              <Building className="w-8 h-8 text-gray-400 mx-auto mb-1" />
                            )}
                            <span className="text-xs text-gray-500">
                              No image
                            </span>
                          </div>
                        )}
                        {profileImagePreview && (
                          <button
                            type="button"
                            onClick={removeProfileImage}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                      <div className="flex-1">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleImageSelect}
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
                        >
                          <Camera className="w-4 h-4" />
                          Choose{" "}
                          {formData.role === "developer" ? "Photo" : "Logo"}
                        </button>
                        <p className="text-xs text-gray-500 mt-1">
                          JPG, PNG up to 5MB
                        </p>
                      </div>
                    </div>
                  </div>
                  {/* Video Upload */}
                  {formData.role === "developer" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Introduction Video
                      </label>
                      <div className="space-y-3">
                        {introVideoPreview && (
                          <div className="relative">
                            <video
                              src={introVideoPreview}
                              controls
                              className="w-full max-h-48 rounded-lg bg-gray-100"
                            />
                            <button
                              type="button"
                              onClick={removeIntroVideo}
                              className="absolute top-2 right-2 w-8 h-8 bg-red-500 bg-opacity-75 text-white rounded-full flex items-center justify-center hover:bg-opacity-100 transition-all"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        )}

                        <div className="flex items-center space-x-4">
                          <div
                            className={`w-24 h-16 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50 ${
                              introVideoPreview ? "opacity-50" : ""
                            }`}
                          >
                            <Video className="w-6 h-6 text-gray-400" />
                          </div>
                          <div className="flex-1">
                            <input
                              ref={videoInputRef}
                              type="file"
                              accept="video/*"
                              onChange={handleVideoSelect}
                              className="hidden"
                            />
                            <button
                              type="button"
                              onClick={() => videoInputRef.current?.click()}
                              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
                            >
                              <Upload className="w-4 h-4" />
                              Choose Video
                            </button>
                            <p className="text-xs text-gray-500 mt-1">
                              MP4, MOV, AVI up to 50MB
                            </p>
                          </div>
                        </div>

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <p className="text-sm text-blue-700">
                            💡 <strong>Tip:</strong> Record a short video (30-60
                            seconds) introducing yourself, your experience, and
                            what makes you unique as a developer.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  {/* Resume Upload */}
                  {formData.role === "developer" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Resume / CV
                      </label>
                      <div className="space-y-3">
                        {(resumeFileName || formData.resumeUrl) && (
                          <div className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg">
                            <div className="flex items-center gap-3 flex-1">
                              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <Upload className="w-5 h-5 text-blue-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {resumeFileName ||
                                    formData.resumeUrl.split("/").pop()}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {resume
                                    ? `${(resume.size / 1024).toFixed(0)} KB`
                                    : "Previously uploaded"}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {formData.resumeUrl && !resume && (
                                <a
                                  href={formData.resumeUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                  title="View Resume"
                                >
                                  <Eye className="w-4 h-4" />
                                </a>
                              )}
                              <button
                                type="button"
                                onClick={removeResume}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Remove Resume"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        )}

                        <div className="flex items-center space-x-4">
                          <div
                            className={`w-24 h-16 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50 ${
                              resumeFileName ? "opacity-50" : ""
                            }`}
                          >
                            <Upload className="w-6 h-6 text-gray-400" />
                          </div>
                          <div className="flex-1">
                            <input
                              ref={resumeInputRef}
                              type="file"
                              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                              onChange={handleResumeSelect}
                              className="hidden"
                            />
                            <button
                              type="button"
                              onClick={() => resumeInputRef.current?.click()}
                              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
                            >
                              <Upload className="w-4 h-4" />
                              {resumeFileName
                                ? "Change Resume"
                                : "Upload Resume"}
                            </button>
                            <p className="text-xs text-gray-500 mt-1">
                              PDF, DOC, DOCX up to 10MB
                            </p>
                          </div>
                        </div>

                        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                          <p className="text-sm text-green-700">
                            📄 <strong>Pro Tip:</strong> Keep your resume
                            updated and highlight your most relevant skills and
                            experience. Use a clean, professional format.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  {/* About Me Section */}
                  <div className="space-y-4">
                    <div className="border-t pt-4">
                      <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        About Me
                      </h3>
                      <p className="text-sm text-gray-600 mb-3">
                        {formData.role === "developer"
                          ? "Tell employers about yourself, your experience, and what you're looking for"
                          : "Describe your company, culture, and what makes it a great place to work"}
                      </p>
                    </div>

                    <div className="border border-gray-300 rounded-lg overflow-hidden">
                      <ReactQuill
                        theme="snow"
                        value={formData.aboutMe}
                        onChange={(content) =>
                          setFormData((prev) => ({ ...prev, aboutMe: content }))
                        }
                        modules={{
                          toolbar: [
                            [{ header: [1, 2, 3, false] }],
                            ["bold", "italic", "underline", "strike"],
                            [{ list: "ordered" }, { list: "bullet" }],
                            [{ align: [] }],
                            ["link", "image"],
                            ["clean"],
                          ],
                        }}
                        formats={[
                          "header",
                          "bold",
                          "italic",
                          "underline",
                          "strike",
                          "list",
                          "bullet",
                          "align",
                          "link",
                          "image",
                        ]}
                        placeholder={
                          formData.role === "developer"
                            ? "Share your story, experience, and career goals..."
                            : "Tell developers about your company, team, and opportunities..."
                        }
                        className="bg-white"
                        style={{ minHeight: "200px" }}
                      />
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-sm text-blue-700">
                        💡 <strong>Tip:</strong> A compelling "About Me" section
                        can help you stand out. Be authentic and highlight what
                        makes you unique!
                      </p>
                    </div>
                  </div>
                  {/* Name Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        name="name"
                        type="text"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                        placeholder="Enter your full name"
                      />
                    </div>
                  </div>
                  {/* Email Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                        placeholder="Enter your email"
                      />
                    </div>
                  </div>
                  {/* Password Section */}
                  <div className="space-y-4">
                    <div className="border-t pt-4">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">
                        Change Password
                      </h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Leave blank to keep current password
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        New Password
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Lock className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          name="password"
                          type={showPassword ? "text" : "password"}
                          value={formData.password}
                          onChange={handleInputChange}
                          className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                          placeholder="Enter new password (optional)"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    {formData.password && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Confirm New Password
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Lock className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            name="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                            className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                            placeholder="Confirm new password"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="h-5 w-5" />
                            ) : (
                              <Eye className="h-5 w-5" />
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  {/* Skills Management */}
                  {formData.role === "developer" && (
                    <div className="space-y-4">
                      <div className="border-t pt-4">
                        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                          <Code className="h-5 w-5" />
                          Skills Management
                        </h3>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-3">
                          Add New Skill
                        </h4>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={newSkillName}
                            onChange={(e) => setNewSkillName(e.target.value)}
                            placeholder="Enter skill name (e.g., Python, React)"
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                            onKeyPress={(e) =>
                              e.key === "Enter" && handleAddSkill()
                            }
                          />
                          <button
                            type="button"
                            onClick={handleAddSkill}
                            disabled={isAddingSkill || !newSkillName.trim()}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                          >
                            {isAddingSkill ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              "Add"
                            )}
                          </button>
                        </div>
                      </div>

                      {formData.skills.length > 0 && (
                        <div className="mb-4">
                          <div className="text-sm text-gray-600 mb-2">
                            Your selected skills:
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {formData.skills.map((skillId) => (
                              <div
                                key={skillId}
                                className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                              >
                                {getSkillName(skillId)}
                                <button
                                  type="button"
                                  onClick={() => removeSkill(skillId)}
                                  className="ml-1 text-blue-600 hover:text-blue-800"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="border border-gray-300 rounded-lg p-4 max-h-48 overflow-y-auto">
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="text-sm font-medium text-gray-700">
                            Available Skills
                          </h4>
                          <span className="text-xs text-gray-500">
                            {availableSkills.length} skills available
                          </span>
                        </div>

                        {skillsLoading ? (
                          <div className="flex items-center justify-center py-4">
                            <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                            <span className="ml-2 text-sm text-gray-600">
                              Loading skills...
                            </span>
                          </div>
                        ) : availableSkills.length > 0 ? (
                          <div className="grid grid-cols-1 gap-2">
                            {availableSkills.map((skill) => (
                              <div
                                key={skill.id}
                                className="flex items-center justify-between p-2 hover:bg-gray-50 rounded group"
                              >
                                <label className="flex items-center space-x-2 cursor-pointer flex-1">
                                  <input
                                    type="checkbox"
                                    checked={formData.skills.includes(skill.id)}
                                    onChange={() => handleSkillToggle(skill.id)}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                  />
                                  <span className="text-sm text-gray-700">
                                    {skill.name}
                                  </span>
                                </label>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteSkill(skill.id)}
                                  className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 p-1 transition-all duration-200"
                                  title="Delete skill"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-4 text-sm text-gray-500">
                            No skills available. Add your first skill above!
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  {/* Action Buttons */}
                  <div className="space-y-3 pt-6 border-t">
                    {/* Draft indicator */}
                    {hasDraft && (
                      <div className="w-full p-3 bg-amber-50 border border-amber-200 rounded-lg">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0" />
                          <span className="text-sm text-amber-700 font-medium">
                            📝 You have unpublished draft changes that only you
                            can see
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-3">
                      {/* Save as Draft Button */}
                      <button
                        onClick={handleSaveAsDraft}
                        disabled={
                          isSavingDraft ||
                          isSaving ||
                          isUploadingImage ||
                          isUploadingVideo ||
                          isUploadingResume
                        }
                        className="flex-1 min-w-[160px] flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                      >
                        {isSavingDraft ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Saving Draft...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4" />
                            Save as Draft
                          </>
                        )}
                      </button>

                      {/* Publish Button */}
                      <button
                        onClick={handleSave}
                        disabled={
                          isSaving ||
                          isSavingDraft ||
                          isUploadingImage ||
                          isUploadingVideo ||
                          isUploadingResume
                        }
                        className="flex-1 min-w-[160px] flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                      >
                        {isSaving ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            {isUploadingImage &&
                              `Uploading Image... ${uploadProgress}%`}
                            {isUploadingVideo &&
                              `Uploading Video... ${uploadProgress}%`}
                            {isUploadingResume &&
                              `Uploading Resume... ${uploadProgress}%`}
                            {!isUploadingImage &&
                              !isUploadingVideo &&
                              !isUploadingResume &&
                              "Publishing..."}
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4" />
                            {hasDraft ? "Publish Changes" : "Save & Publish"}
                          </>
                        )}
                      </button>

                      {/* Cancel Button */}
                      <button
                        onClick={handleCancel}
                        disabled={
                          isSaving ||
                          isSavingDraft ||
                          isUploadingImage ||
                          isUploadingVideo ||
                          isUploadingResume
                        }
                        className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-all duration-200 disabled:opacity-50"
                      >
                        Cancel
                      </button>

                      {/* Discard Draft Button (only show if draft exists) */}
                      {hasDraft && (
                        <button
                          onClick={handleDiscardDraft}
                          disabled={
                            isSaving ||
                            isSavingDraft ||
                            isUploadingImage ||
                            isUploadingVideo ||
                            isUploadingResume
                          }
                          className="px-4 py-3 border-2 border-red-300 text-red-700 rounded-lg font-medium hover:bg-red-50 transition-all duration-200 disabled:opacity-50 flex items-center gap-2"
                          title="Discard draft and revert to published version"
                        >
                          <Trash2 className="h-4 w-4" />
                          Discard Draft
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Profile Image Display */}
                  {((user?.role === "developer" && user?.profileImageUrl) ||
                    (user?.role === "employer" && user?.companyPhoto) ||
                    profileImagePreview) && (
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">
                        {user?.role === "developer"
                          ? "Profile Photo"
                          : "Company Logo"}
                      </h3>
                      <div className="flex justify-center">
                        <img
                          src={
                            user?.role === "developer"
                              ? user?.profileImageUrl || profileImagePreview
                              : user?.companyPhoto || profileImagePreview
                          }
                          alt={
                            user?.role === "developer"
                              ? "Profile"
                              : "Company Logo"
                          }
                          className="w-32 h-32 object-cover rounded-lg border-2 border-gray-200"
                        />
                      </div>
                    </div>
                  )}

                  {/* Video Display - WITH MODAL */}
                  {user?.role === "developer" &&
                    (user?.introVideoUrl || introVideoPreview) && (
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                          <Video className="h-5 w-5" />
                          Introduction Video
                        </h3>
                        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                <Video className="w-6 h-6 text-purple-600" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  Introduction Video
                                </p>
                                <p className="text-xs text-gray-600">
                                  Click to watch your intro video
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={openVideoModal}
                              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors duration-200"
                            >
                              <Play className="w-4 h-4" />
                              Watch Video
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                  {/* Resume Display - WITH MODAL */}
                  {user?.role === "developer" && user?.resumeUrl && (
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                        <Upload className="h-5 w-5" />
                        Resume / CV
                      </h3>
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                              <Upload className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {user.resumeUrl.split("/").pop()}
                              </p>
                              <p className="text-xs text-gray-600">
                                Resume document uploaded
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={openResumeModal}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors duration-200"
                          >
                            <Eye className="w-4 h-4" />
                            View Resume
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* About Me Display */}
                  {user?.aboutMe && (
                    <div className="border-t pt-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        About{" "}
                        {user?.role === "developer" ? "Me" : "Our Company"}
                      </h3>
                      <div
                        className="prose prose-sm max-w-none bg-gray-50 rounded-lg p-4 border border-gray-200"
                        dangerouslySetInnerHTML={{ __html: user.aboutMe }}
                      />
                    </div>
                  )}

                  {/* Basic Information */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Basic Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">
                          Name
                        </label>
                        <p className="text-gray-900 font-medium">
                          {user?.name}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">
                          Email
                        </label>
                        <p className="text-gray-900 font-medium">
                          {user?.email}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">
                          Account Type
                        </label>
                        <p className="text-gray-900 font-medium capitalize">
                          {user?.role}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Skills Section */}
                  {user?.role === "developer" && (
                    <div className="border-t pt-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                        <Code className="h-5 w-5" />
                        Skills
                      </h3>
                      {user?.skills && user.skills.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {user.skills.map((skillId) => (
                            <span
                              key={skillId}
                              className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                            >
                              {getSkillName(skillId) || `Skill ID: ${skillId}`}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 italic">
                          No skills added yet
                        </p>
                      )}
                    </div>
                  )}

                  {/* Company Dashboard */}
                  {user?.role === "employer" && (
                    <div className="border-t pt-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                        <Building className="h-5 w-5" />
                        Company Dashboard
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                              <Briefcase className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                              <div className="text-2xl font-bold text-purple-600">
                                {jobsLoading ? (
                                  <Loader2 className="h-6 w-6 animate-spin" />
                                ) : (
                                  jobsCount
                                )}
                              </div>
                              <div className="text-sm text-purple-700">
                                Job Opportunities Posted
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                              <User className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <div className="text-2xl font-bold text-blue-600">
                                Active
                              </div>
                              <div className="text-sm text-blue-700">
                                Account Status
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 bg-gray-50 rounded-lg p-4">
                        <p className="text-gray-600 text-sm">
                          Manage your company profile and job postings. You can
                          post new jobs, review applications from developers,
                          and track your hiring progress.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ✅ VIDEO MODAL */}
      {showVideoModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4 animate-fadeIn"
          onClick={closeVideoModal}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden animate-slideUp"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-indigo-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <Video className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Introduction Video
                  </h3>
                  <p className="text-sm text-gray-600">{user?.name}</p>
                </div>
              </div>
              <button
                onClick={closeVideoModal}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-200 transition-colors"
                title="Close (ESC)"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 bg-gray-900">
              <video
                src={user?.introVideoUrl}
                controls
                autoPlay
                className="w-full rounded-lg shadow-lg"
                style={{ maxHeight: "70vh" }}
              >
                Your browser does not support the video tag.
              </video>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
              <p className="text-sm text-gray-600">
                💡 Tip: Press{" "}
                <kbd className="px-2 py-1 bg-gray-200 rounded text-xs font-mono">
                  ESC
                </kbd>{" "}
                to close
              </p>
              <button
                onClick={closeVideoModal}
                className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ RESUME MODAL */}
      {showResumeModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4 animate-fadeIn"
          onClick={closeResumeModal}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden animate-slideUp"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <FileText className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Resume / CV
                  </h3>
                  <p className="text-sm text-gray-600">{user?.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={user?.resumeUrl}
                  download
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                  title="Download Resume"
                >
                  <Download className="w-4 h-4" />
                  Download
                </a>
                <button
                  onClick={closeResumeModal}
                  className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-200 transition-colors"
                  title="Close (ESC)"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 bg-gray-100 h-[calc(90vh-180px)] overflow-auto">
              <iframe
                src={user?.resumeUrl}
                className="w-full h-full rounded-lg shadow-lg bg-white"
                title={`${user?.name}'s Resume`}
              />
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
              <p className="text-sm text-gray-600">
                💡 Tip: Press{" "}
                <kbd className="px-2 py-1 bg-gray-200 rounded text-xs font-mono">
                  ESC
                </kbd>{" "}
                to close
              </p>
              <button
                onClick={closeResumeModal}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            transform: translateY(50px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }

        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }

        kbd {
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </>
  );
};

export default Profile;
