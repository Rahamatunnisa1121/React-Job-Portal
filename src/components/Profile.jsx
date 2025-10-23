import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { User, ArrowLeft, Upload, Camera, Loader2 } from 'lucide-react';

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
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    designation: '',
    email: '',
    password: '',
  });
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setMessage({ type: 'error', text: 'File size should be less than 5MB' });
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        setMessage({ type: 'error', text: 'Please select a valid image file' });
        return;
      }
      
      setProfilePhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
      setMessage({ type: '', text: '' });
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
    
    // Validation
    if (!formData.name.trim()) {
      setMessage({ type: 'error', text: 'Name is required' });
      return;
    }
    if (!formData.designation.trim()) {
      setMessage({ type: 'error', text: 'Designation is required' });
      return;
    }
    if (!formData.email.trim()) {
      setMessage({ type: 'error', text: 'Email is required' });
      return;
    }
    if (!formData.password || formData.password.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
      return;
    }
    
    setIsSubmitting(true);
    setMessage({ type: '', text: '' });
    
    try {
      let profilePhotoUrl = null;
      
      // Upload photo to S3 if selected
      if (profilePhoto) {
        try {
          profilePhotoUrl = await uploadToS3(profilePhoto, 'employer_photos');
        } catch (error) {
          setMessage({ type: 'error', text: 'Failed to upload profile photo' });
          setIsSubmitting(false);
          return;
        }
      }
      
      // Create employer
      const employerData = {
        companyId: user.companyId,
        name: formData.name.trim(),
        designation: formData.designation.trim(),
        email: formData.email.trim(),
        password: formData.password, // Note: Should be hashed on backend
        profilePhoto: profilePhotoUrl
      };
      
      console.log('Sending employer data:', employerData);
      
      const response = await fetch('/api/employers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(employerData)
      });
      
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      
      // Check if response has content
      const contentType = response.headers.get('content-type');
      const responseText = await response.text();
      console.log('Response text:', responseText);
      
      if (!response.ok) {
        let errorMessage = 'Failed to create employer';
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          errorMessage = responseText || errorMessage;
        }
        throw new Error(errorMessage);
      }
      
      // Parse the response
      let newEmployer;
      try {
        newEmployer = responseText ? JSON.parse(responseText) : null;
      } catch (e) {
        console.error('Failed to parse response:', responseText);
        throw new Error('Invalid response from server');
      }
      
      if (!newEmployer || !newEmployer.id) {
        throw new Error('Server did not return employer data with ID');
      }
      
      console.log('Employer created:', newEmployer);
      
      // Update company's employerIds
      console.log('Fetching company data for ID:', user.companyId);
      
      const companyResponse = await fetch(`/api/companies/${user.companyId}`);
      console.log('Company response status:', companyResponse.status);
      
      if (!companyResponse.ok) {
        throw new Error(`Failed to fetch company data (Status: ${companyResponse.status})`);
      }
      
      const companyText = await companyResponse.text();
      console.log('Company response text:', companyText);
      
      let company;
      try {
        company = companyText ? JSON.parse(companyText) : null;
      } catch (e) {
        console.error('Failed to parse company response:', companyText);
        throw new Error('Invalid company data from server');
      }
      
      if (!company) {
        throw new Error('Company not found');
      }
      
      console.log('Current company data:', company);
      
      const updatedEmployerIds = [...(company.employerIds || []), newEmployer.id];
      console.log('Updated employerIds:', updatedEmployerIds);
      
      const updateResponse = await fetch(`/api/companies/${user.companyId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          employerIds: updatedEmployerIds
        })
      });
      
      console.log('Update response status:', updateResponse.status);
      
      if (!updateResponse.ok) {
        const updateText = await updateResponse.text();
        console.error('Update failed:', updateText);
        throw new Error(`Failed to update company (Status: ${updateResponse.status})`);
      }
      
      console.log('Company employerIds updated:', updatedEmployerIds);
      
      setMessage({ type: 'success', text: '✅ Employer added successfully!' });
      
      // Navigate back after a short delay to show success message
      setTimeout(() => {
        navigate('/manage-employers');
      }, 1500);
      
    } catch (error) {
      console.error('Error adding employer:', error);
      setMessage({ type: 'error', text: `Failed to add employer: ${error.message}` });
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/manage-employers')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Employers
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Add New Employer</h1>
          <p className="text-gray-600 mt-2">Fill in the details to add a new employer to your company</p>
        </div>

        {/* Message Display */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-700'
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}>
            <p className="text-sm font-medium">{message.text}</p>
          </div>
        )}

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="px-8 py-6 bg-gradient-to-r from-purple-600 to-pink-600">
            <h2 className="text-xl font-bold text-white">Employer Information</h2>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {/* Profile Photo Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Profile Photo</label>
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
                  <label className="cursor-pointer bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 inline-flex items-center gap-2 transition-colors">
                    <Camera className="w-4 h-4" />
                    Choose Photo
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                      disabled={isSubmitting}
                    />
                  </label>
                  <p className="text-sm text-gray-500 mt-2">JPG, PNG or GIF (max. 5MB)</p>
                </div>
              </div>
              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="mt-4">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-purple-600 h-2.5 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-600 mt-2">Uploading photo... {uploadProgress}%</p>
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
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                onChange={(e) => setFormData({...formData, designation: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="employer@company.com"
                required
                disabled={isSubmitting}
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium transition-all shadow-md hover:shadow-lg"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {uploadProgress > 0 && uploadProgress < 100 
                      ? `Uploading... ${uploadProgress}%` 
                      : 'Adding Employer...'}
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5" />
                    Add Employer
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => navigate('/manage-employers')}
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