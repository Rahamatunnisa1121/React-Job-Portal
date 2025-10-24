import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { User, ArrowLeft } from "lucide-react";
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

const AddEmployer = () => {
  const navigate = useNavigate();

  // Get user from localStorage or context
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    designation: "",
    email: "",
    password: "",
    salary:""
  });
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("File size should be less than 5MB");
        return;
      }

      setProfilePhoto(file);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let profilePhotoUrl = null;

      // Upload photo to S3 if selected
      if (profilePhoto) {
        profilePhotoUrl = await uploadToS3(profilePhoto, "employer_photos");
      }

      // Create employer
      const employerData = {
        companyId: user.id,
        name: formData.name,
        designation: formData.designation,
        email: formData.email,
        password: formData.password, // Note: Should be hashed on backend
        salary: parseFloat(formData.salary),
        profilePhoto: profilePhotoUrl,
      };

      const response = await fetch(`/api/employers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(employerData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create employer");
      }

      const newEmployer = await response.json();
      console.log("Employer created:", newEmployer);

      // Update company's employerIds
      const companyResponse = await fetch(`/api/companies/${user.id}`);
      console.log(companyResponse);
      if (!companyResponse.ok) throw new Error("Failed to fetch company data");

      const company = await companyResponse.json();

      const updatedEmployerIds = [
        ...(company.employerIds || []),
        newEmployer.id,
      ];

      const updateResponse = await fetch(`/api/companies/${user.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          employerIds: updatedEmployerIds,
        }),
      });

      if (!updateResponse.ok) throw new Error("Failed to update company");

      console.log("Company employerIds updated:", updatedEmployerIds);

      alert("Employer added successfully!");
      navigate("/company-employers"); // Navigate back to employers list
    } catch (error) {
      console.error("Error adding employer:", error);
      alert(`Failed to add employer: ${error.message}`);
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate("/company-employers")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Employers
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Add New Employer</h1>
          <p className="text-gray-600 mt-2">
            Fill in the details to add a new employer to your company
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Photo Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Profile Photo
              </label>
              <div className="flex items-center gap-6">
                {photoPreview ? (
                  <img
                    src={photoPreview}
                    alt="Preview"
                    className="w-24 h-24 rounded-full object-cover border-4 border-gray-200"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
                    <User className="w-12 h-12 text-gray-400" />
                  </div>
                )}
                <div>
                  <label className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 inline-block transition-colors">
                    Choose Photo
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                      disabled={isSubmitting}
                    />
                  </label>
                  <p className="text-sm text-gray-500 mt-2">
                    JPG, PNG or GIF (max. 5MB)
                  </p>
                </div>
              </div>
              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="mt-4">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    Uploading photo... {uploadProgress}%
                  </p>
                </div>
              )}
            </div>

            <hr className="border-gray-200" />

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter full name"
                required
                disabled={isSubmitting}
              />
            </div>

            {/* Designation */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Designation <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.designation}
                onChange={(e) =>
                  setFormData({ ...formData, designation: e.target.value })
                }
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., HR Manager, Senior Developer"
                required
                disabled={isSubmitting}
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="employer@company.com"
                required
                disabled={isSubmitting}
              />
            </div>
            {/* Salary */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Salary (Annual) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">
                  ₹
                </span>
                <input
                  type="number"
                  value={formData.salary}
                  onChange={(e) =>
                    setFormData({ ...formData, salary: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg pl-8 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 500000"
                  required
                  disabled={isSubmitting}
                  min="0"
                  step="1000"
                />
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Enter annual salary amount in rupees
              </p>
            </div>
            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter password (min. 6 characters)"
                required
                disabled={isSubmitting}
                minLength={6}
              />
              <p className="text-sm text-gray-500 mt-2">
                Password should be at least 6 characters long
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium transition-colors"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Adding Employer...
                  </>
                ) : (
                  "Add Employer"
                )}
              </button>
              <button
                type="button"
                onClick={() => navigate("/company-employers")}
                disabled={isSubmitting}
                className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddEmployer;
