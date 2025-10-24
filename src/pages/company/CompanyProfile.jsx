import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import {
  Building2,
  Mail,
  Briefcase,
  Users,
  Edit,
  Save,
  X,
  FileText,
  Lock,
  Eye,
  EyeOff,
  Camera,
  ArrowRight,
  AlertCircle,
  Trash2,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

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

const CompanyProfile = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();

  const [companyData, setCompanyData] = useState(null);
  const [employersCount, setEmployersCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [companyPhoto, setCompanyPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [existingPhotoUrl, setExistingPhotoUrl] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Draft states
  const [hasDraft, setHasDraft] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [draftData, setDraftData] = useState(null);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    industry: "",
    email: "",
    password: "",
    companyPhoto: "",
  });

  useEffect(() => {
    fetchCompanyData();
  }, []);

  useEffect(() => {
    if (companyData) {
      // Check if company has draft data
      const hasSavedDraft =
        companyData.draft && Object.keys(companyData.draft).length > 0;
      setHasDraft(hasSavedDraft);
      setDraftData(companyData.draft);

      // Load either draft or published data when editing
      const dataToLoad =
        hasSavedDraft && editMode ? companyData.draft : companyData;

      setFormData({
        name: dataToLoad.name || "",
        description: dataToLoad.description || "",
        industry: dataToLoad.industry || "",
        email: dataToLoad.email || "",
        password: "",
        companyPhoto: dataToLoad.companyPhoto || "",
      });

      if (dataToLoad.companyPhoto) {
        setExistingPhotoUrl(dataToLoad.companyPhoto);
        setPhotoPreview(dataToLoad.companyPhoto);
      }
    }
  }, [companyData, editMode]);

  const fetchCompanyData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/companies/${user.id}`);

      if (!response.ok) {
        throw new Error("Failed to fetch company data");
      }

      const company = await response.json();
      setCompanyData(company);
      setEmployersCount(company.employerIds?.length || 0);

      setFormData({
        name: company.name || "",
        description: company.description || "",
        industry: company.industry || "",
        email: company.email || "",
        password: "",
        companyPhoto: company.companyPhoto || "",
      });

      if (company.companyPhoto) {
        setExistingPhotoUrl(company.companyPhoto);
        setPhotoPreview(company.companyPhoto);
      }
    } catch (error) {
      console.error("Error fetching company data:", error);
      setMessage({ type: "error", text: "Failed to load company data" });
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setMessage({
          type: "error",
          text: "File size should be less than 5MB",
        });
        return;
      }

      setCompanyPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadToS3 = async (file, folder) => {
    try {
      const fileExtension = file.name.split(".").pop();
      const timestamp = Date.now();
      const fileName = `${YOUR_NAME}/${folder}/${user.id}_${folder}_${timestamp}.${fileExtension}&embedded=true`;

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

  const validateForm = () => {
    if (!formData.name.trim()) return "Company name is required";
    if (!formData.email.trim()) return "Email is required";
    if (!formData.industry) return "Industry is required";
    if (!formData.description.trim()) return "Description is required";

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim()))
      return "Please enter a valid email address";

    if (formData.password && formData.password.length < 6) {
      return "Password must be at least 6 characters long";
    }

    return null;
  };

  // New function: Save as Draft
  const handleSaveAsDraft = async () => {
    const validationError = validateForm();
    if (validationError) {
      setMessage({ type: "error", text: validationError });
      return;
    }

    setIsSavingDraft(true);
    setMessage({ type: "", text: "" });

    try {
      let companyPhotoUrl = existingPhotoUrl;

      if (companyPhoto) {
        try {
          companyPhotoUrl = await uploadToS3(companyPhoto, "company_photos");
        } catch (error) {
          setMessage({ type: "error", text: "Failed to upload company photo" });
          setIsSavingDraft(false);
          return;
        }
      }

      // Prepare draft data object
      const draftObject = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        industry: formData.industry,
        email: formData.email.trim(),
        companyPhoto: companyPhotoUrl,
      };

      // Add password only if changed
      if (formData.password && formData.password.trim()) {
        draftObject.password = formData.password;
      }

      // First, get the current company data
      const getCurrentCompany = await fetch(`/api/companies/${user.id}`);
      if (!getCurrentCompany.ok)
        throw new Error("Failed to fetch current company");
      const currentCompany = await getCurrentCompany.json();

      // Update company with draft data using PATCH
      const response = await fetch(`/api/companies/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...currentCompany,
          draft: draftObject,
        }),
      });

      if (!response.ok) throw new Error("Failed to save draft");
      const updatedCompany = await response.json();

      // Update local state with draft
      setCompanyData(updatedCompany);
      setHasDraft(true);
      setDraftData(updatedCompany.draft);

      // Clear file inputs but keep form data
      setCompanyPhoto(null);

      // Update previews
      setPhotoPreview(companyPhotoUrl || "");
      setExistingPhotoUrl(companyPhotoUrl);

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
      setUploadProgress(0);
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
      // Get current company data
      const getCurrentCompany = await fetch(`/api/companies/${user.id}`);
      if (!getCurrentCompany.ok)
        throw new Error("Failed to fetch current company");
      const currentCompany = await getCurrentCompany.json();

      // Remove draft field
      const { draft, ...companyWithoutDraft } = currentCompany;

      // Update company without draft
      const response = await fetch(`/api/companies/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(companyWithoutDraft),
      });

      if (!response.ok) throw new Error("Failed to discard draft");
      const updatedCompany = await response.json();

      setCompanyData(updatedCompany);
      setHasDraft(false);
      setDraftData(null);

      // Reset form to published data
      setFormData({
        name: updatedCompany.name || "",
        description: updatedCompany.description || "",
        industry: updatedCompany.industry || "",
        email: updatedCompany.email || "",
        password: "",
        companyPhoto: updatedCompany.companyPhoto || "",
      });

      setCompanyPhoto(null);
      setPhotoPreview(updatedCompany.companyPhoto || "");
      setExistingPhotoUrl(updatedCompany.companyPhoto || "");

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

    try {
      setIsSaving(true);
      setMessage({ type: "", text: "" });

      let companyPhotoUrl = existingPhotoUrl;

      if (companyPhoto) {
        companyPhotoUrl = await uploadToS3(companyPhoto, "company_photos");
      }

      // Get current company data first
      const getCurrentCompany = await fetch(`/api/companies/${user.id}`);
      if (!getCurrentCompany.ok)
        throw new Error("Failed to fetch current company");
      const currentCompany = await getCurrentCompany.json();

      // If there's a draft, use draft data as the source, otherwise use form data
      const sourceData =
        hasDraft && currentCompany.draft ? currentCompany.draft : formData;

      // Build update data and explicitly set draft to null to remove it
      const updateData = {
        id: currentCompany.id,
        name: sourceData.name?.trim() || formData.name.trim(),
        description:
          sourceData.description?.trim() || formData.description.trim(),
        industry: sourceData.industry || formData.industry,
        email: sourceData.email?.trim() || formData.email.trim(),
        companyPhoto: companyPhotoUrl,
        employerIds: currentCompany.employerIds || [],
        draft: null, // Explicitly set to null to remove draft from database
      };

      // Add password only if changed (check both draft and form)
      const draftPassword = hasDraft && currentCompany.draft?.password;
      const formPassword = formData.password && formData.password.trim();

      if (draftPassword || formPassword) {
        updateData.password = draftPassword || formPassword;
      }

      const response = await fetch(`/api/companies/${user.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update company");
      }

      const updatedCompany = await response.json();

      // Clear draft state immediately after successful publish
      setCompanyData(updatedCompany);
      setHasDraft(false);
      setDraftData(null);
      setExistingPhotoUrl(companyPhotoUrl);
      setCompanyPhoto(null);

      // Reset form data to published values (no draft)
      setFormData({
        name: updatedCompany.name || "",
        description: updatedCompany.description || "",
        industry: updatedCompany.industry || "",
        email: updatedCompany.email || "",
        password: "",
        companyPhoto: updatedCompany.companyPhoto || "",
      });

      setEditMode(false);

      setMessage({
        type: "success",
        text: "✨ Company profile published successfully! Draft has been removed.",
      });

      // Update user context if needed
      if (updateUser) {
        updateUser({ ...user, company: updatedCompany });
      }
    } catch (error) {
      console.error("Error updating company:", error);
      setMessage({
        type: "error",
        text: `Failed to update company: ${error.message}`,
      });
    } finally {
      setIsSaving(false);
      setUploadProgress(0);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: companyData.name || "",
      description: companyData.description || "",
      industry: companyData.industry || "",
      email: companyData.email || "",
      password: "",
      companyPhoto: companyData.companyPhoto || "",
    });
    setPhotoPreview(existingPhotoUrl);
    setCompanyPhoto(null);
    setEditMode(false);
    setUploadProgress(0);
    setMessage({ type: "", text: "" });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 text-lg font-medium">
            Loading company profile...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section with Gradient */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-xl p-8 mb-8 text-white">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-6">
              {photoPreview ? (
                <img
                  src={photoPreview}
                  alt="Company Logo"
                  className="w-20 h-20 rounded-xl object-cover border-4 border-white/30 shadow-lg"
                />
              ) : (
                <div className="w-20 h-20 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center border-4 border-white/30">
                  <Building2 className="w-10 h-10 text-white" />
                </div>
              )}
              <div>
                <h1 className="text-4xl font-bold mb-2">{companyData?.name}</h1>
                <p className="text-blue-100 text-lg">{companyData?.industry}</p>
              </div>
            </div>
            {!editMode && (
              <button
                onClick={() => setEditMode(true)}
                className="bg-white text-blue-600 px-6 py-3 rounded-xl hover:bg-blue-50 flex items-center gap-2 font-semibold transition-all shadow-lg hover:shadow-xl hover:scale-105"
              >
                <Edit className="w-5 h-5" />
                Edit Profile
              </button>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all p-6 border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                <Building2 className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                  Company ID
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {companyData?.id}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all p-6 border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
                <Users className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                  Total Employers
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {employersCount}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all p-6 border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg">
                <Briefcase className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                  Industry
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {companyData?.industry}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Profile Card */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-gray-900">
                  Company Information
                </h2>
                {editMode && (
                  <span className="px-4 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                    Editing Mode
                  </span>
                )}
              </div>

              {/* Message Alert */}
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

              <div className="space-y-6">
                {/* Company Logo Upload - Only in Edit Mode */}
                {editMode && (
                  <div className="pb-6 border-b border-gray-200">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">
                      <Camera className="w-4 h-4" />
                      Company Logo
                    </label>
                    <div className="flex items-center gap-6">
                      {photoPreview ? (
                        <img
                          src={photoPreview}
                          alt="Company Logo"
                          className="w-24 h-24 rounded-xl object-cover border-4 border-blue-100 shadow-md"
                        />
                      ) : (
                        <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center border-4 border-gray-200">
                          <Building2 className="w-12 h-12 text-gray-400" />
                        </div>
                      )}
                      <div>
                        <label className="cursor-pointer bg-gradient-to-r from-blue-600 to-blue-700 text-white px-5 py-2.5 rounded-xl hover:from-blue-700 hover:to-blue-800 inline-block transition-all shadow-md hover:shadow-lg font-medium">
                          {photoPreview ? "Change Logo" : "Upload Logo"}
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handlePhotoChange}
                            className="hidden"
                            disabled={isSaving || isSavingDraft}
                          />
                        </label>
                        <p className="text-sm text-gray-500 mt-2">
                          JPG, PNG or GIF (max. 5MB)
                        </p>
                      </div>
                    </div>
                    {uploadProgress > 0 && uploadProgress < 100 && (
                      <div className="mt-4">
                        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                        <p className="text-sm text-gray-600 mt-2 font-medium">
                          Uploading logo... {uploadProgress}%
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Company Name */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                    <Building2 className="w-4 h-4 text-blue-600" />
                    Company Name{" "}
                    {editMode && <span className="text-red-500">*</span>}
                  </label>
                  {editMode ? (
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-lg"
                      placeholder="Enter company name"
                      required
                      disabled={isSaving || isSavingDraft}
                    />
                  ) : (
                    <p className="text-gray-900 text-lg font-medium bg-gray-50 px-4 py-3.5 rounded-xl border border-gray-200">
                      {companyData?.name || "Not provided"}
                    </p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                    <FileText className="w-4 h-4 text-blue-600" />
                    Description{" "}
                    {editMode && <span className="text-red-500">*</span>}
                  </label>
                  {editMode ? (
                    <textarea
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all min-h-[120px] text-lg"
                      placeholder="Enter company description"
                      required
                      disabled={isSaving || isSavingDraft}
                    />
                  ) : (
                    <p className="text-gray-900 text-lg bg-gray-50 px-4 py-3.5 rounded-xl whitespace-pre-wrap border border-gray-200 leading-relaxed">
                      {companyData?.description || "Not provided"}
                    </p>
                  )}
                </div>

                {/* Industry */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                    <Briefcase className="w-4 h-4 text-blue-600" />
                    Industry{" "}
                    {editMode && <span className="text-red-500">*</span>}
                  </label>
                  {editMode ? (
                    <select
                      value={formData.industry}
                      onChange={(e) =>
                        setFormData({ ...formData, industry: e.target.value })
                      }
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-lg"
                      required
                      disabled={isSaving || isSavingDraft}
                    >
                      <option value="">Select industry</option>
                      <option value="Technology">Technology</option>
                      <option value="Healthcare">Healthcare</option>
                      <option value="Finance">Finance</option>
                      <option value="Education">Education</option>
                      <option value="Manufacturing">Manufacturing</option>
                      <option value="Retail">Retail</option>
                      <option value="Construction">Construction</option>
                      <option value="Hospitality">Hospitality</option>
                      <option value="Transportation">Transportation</option>
                      <option value="Real Estate">Real Estate</option>
                      <option value="Entertainment">Entertainment</option>
                      <option value="Agriculture">Agriculture</option>
                      <option value="Other">Other</option>
                    </select>
                  ) : (
                    <p className="text-gray-900 text-lg font-medium bg-gray-50 px-4 py-3.5 rounded-xl border border-gray-200">
                      {companyData?.industry || "Not provided"}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                    <Mail className="w-4 h-4 text-blue-600" />
                    Email Address{" "}
                    {editMode && <span className="text-red-500">*</span>}
                  </label>
                  {editMode ? (
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-lg"
                      placeholder="company@example.com"
                      required
                      disabled={isSaving || isSavingDraft}
                    />
                  ) : (
                    <p className="text-gray-900 text-lg font-medium bg-gray-50 px-4 py-3.5 rounded-xl border border-gray-200">
                      {companyData?.email || "Not provided"}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                    <Lock className="w-4 h-4 text-blue-600" />
                    Password
                  </label>
                  {editMode ? (
                    <div>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={formData.password}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              password: e.target.value,
                            })
                          }
                          className="w-full border-2 border-gray-200 rounded-xl px-4 py-3.5 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-lg"
                          placeholder="Leave blank to keep current password"
                          minLength={6}
                          disabled={isSaving || isSavingDraft}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {showPassword ? (
                            <EyeOff className="w-5 h-5" />
                          ) : (
                            <Eye className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                      <p className="text-sm text-gray-500 mt-2">
                        Leave blank to keep current password. Must be at least 6
                        characters if changing.
                      </p>
                    </div>
                  ) : (
                    <p className="text-gray-900 text-lg font-medium bg-gray-50 px-4 py-3.5 rounded-xl border border-gray-200">
                      ••••••••
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              {editMode && (
                <div className="space-y-3 pt-6 border-t border-gray-200">
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
                      disabled={isSavingDraft || isSaving}
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
                      disabled={isSaving || isSavingDraft}
                      className="flex-1 min-w-[160px] flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          {uploadProgress > 0 && uploadProgress < 100
                            ? `Uploading... ${uploadProgress}%`
                            : "Publishing..."}
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
                      disabled={isSaving || isSavingDraft}
                      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Cancel
                    </button>

                    {/* Discard Draft Button (only show if draft exists) */}
                    {hasDraft && (
                      <button
                        onClick={handleDiscardDraft}
                        disabled={isSaving || isSavingDraft}
                        className="px-4 py-3 border-2 border-red-300 text-red-700 rounded-lg font-medium hover:bg-red-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        title="Discard draft and revert to published version"
                      >
                        <Trash2 className="h-4 w-4" />
                        Discard Draft
                      </button>
                    )}
                  </div>

                  {/* Info Box */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                    <div className="flex gap-3">
                      <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-blue-700">
                        <p className="font-semibold mb-1">
                          💡 How Draft Mode Works:
                        </p>
                        <ul className="space-y-1 ml-4 list-disc">
                          <li>
                            <strong>Save as Draft:</strong> Save your changes
                            privately - only you can see them
                          </li>
                          <li>
                            <strong>Publish Changes:</strong> Make your changes
                            visible to everyone
                          </li>
                          <li>
                            <strong>Discard Draft:</strong> Delete draft and
                            revert to published version
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 sticky top-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Quick Actions
              </h2>
              <div className="space-y-4">
                <button
                  onClick={() => navigate("/company-employers")}
                  className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-200 rounded-xl hover:from-blue-100 hover:to-blue-200 hover:border-blue-300 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-gray-900">
                        Manage Employers
                      </p>
                      <p className="text-sm text-gray-600">
                        View all employers
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-blue-600 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={() => navigate("/add-employer")}
                  className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-purple-100 border-2 border-purple-200 rounded-xl hover:from-purple-100 hover:to-purple-200 hover:border-purple-300 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-600 flex items-center justify-center">
                      <Edit className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-gray-900">
                        Add Employer
                      </p>
                      <p className="text-sm text-gray-600">
                        Create new account
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-purple-600 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              {/* Draft Status Card */}
              {hasDraft && !editMode && (
                <div className="mt-6 p-4 bg-amber-50 border-2 border-amber-200 rounded-xl">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-amber-900 text-sm mb-1">
                        Unpublished Changes
                      </p>
                      <p className="text-xs text-amber-700 mb-3">
                        You have draft changes that aren't visible to others
                        yet.
                      </p>
                      <button
                        onClick={() => setEditMode(true)}
                        className="text-xs font-medium text-amber-700 hover:text-amber-900 underline"
                      >
                        Review Draft →
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyProfile;
