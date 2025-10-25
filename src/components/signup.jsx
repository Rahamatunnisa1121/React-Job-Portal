import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Briefcase,
  AlertCircle,
  Loader2,
  CheckCircle,
  Code,
  X,
  Building2,
  FileText,
} from "lucide-react";

const Signup = () => {
  const [emailError, setEmailError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "developer",
    skills: [],
    // Company fields
    companyName: "",
    companyDescription: "",
    companyIndustry: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [availableSkills, setAvailableSkills] = useState([]);
  const [skillsLoading, setSkillsLoading] = useState(false);
  const [skillsError, setSkillsError] = useState("");

  // Fetch skills when component mounts
  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    setSkillsLoading(true);
    setSkillsError("");

    try {
      const response = await fetch("/api/skills");
      if (!response.ok) {
        throw new Error("Failed to fetch skills");
      }
      const skills = await response.json();
      setAvailableSkills(skills);
    } catch (error) {
      console.error("Error fetching skills:", error);
      setSkillsError("Failed to load skills. Please try again.");
    } finally {
      setSkillsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "email") {
      setEmailError("");
    }

    if (error) {
      setError("");
    }

    // Reset skills when role changes to employer or company
    if (name === "role" && (value === "employer" || value === "company")) {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        skills: [],
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
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
    const skill = availableSkills.find((s) => s.id === skillId);
    return skill ? skill.name : "";
  };

  const validateEmail = (email) => {
    const regex =
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return regex.test(email);
  };

  const getDetailedEmailError = (email) => {
    if (!email || email.trim() === "") {
      return "";
    }

    const trimmedEmail = email.trim();

    if (!trimmedEmail.includes("@")) {
      return "Email must contain an @ symbol";
    }

    const parts = trimmedEmail.split("@");

    if (parts.length !== 2) {
      return "Email must contain exactly one @ symbol";
    }

    const [localPart, domainPart] = parts;

    if (!localPart || localPart.length === 0) {
      return "Email must have text before the @ symbol";
    }

    if (!domainPart || domainPart.length === 0) {
      return "Email must have a domain after the @ symbol";
    }

    if (!domainPart.includes(".")) {
      return "Domain must contain a dot (e.g., .com, .org)";
    }

    const domainParts = domainPart.split(".");

    if (domainParts.length < 2) {
      return "Domain must have at least one dot (e.g., .com, .org)";
    }

    if (domainParts.some((part) => part.length === 0)) {
      return "Domain cannot have empty parts (check your dots)";
    }

    if (domainPart.startsWith(".") || domainPart.endsWith(".")) {
      return "Domain cannot start or end with a dot";
    }

    if (domainPart.startsWith("-") || domainPart.endsWith("-")) {
      return "Domain cannot start or end with a hyphen";
    }

    const validLocalRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+$/;
    if (!validLocalRegex.test(localPart)) {
      return "Email contains invalid characters before @";
    }

    const validDomainRegex = /^[a-zA-Z0-9.-]+$/;
    if (!validDomainRegex.test(domainPart)) {
      return "Domain contains invalid characters";
    }

    const tld = domainParts[domainParts.length - 1];
    if (tld.length < 2) {
      return "Domain extension must be at least 2 characters (e.g., .com, .org)";
    }

    if (trimmedEmail.includes("..")) {
      return "Email cannot contain consecutive dots";
    }

    if (!validateEmail(trimmedEmail)) {
      return "Please enter a valid email address";
    }

    return "";
  };

  const handleEmailBlur = () => {
    const email = formData.email.trim();

    if (email === "") {
      setEmailError("");
      return;
    }

    const detailedError = getDetailedEmailError(email);
    setEmailError(detailedError);
  };

  const handleEmailInput = (e) => {
    handleInputChange(e);

    if (emailError || e.target.value.trim().length > 0) {
      const email = e.target.value.trim();

      if (email.length > 0) {
        const detailedError = getDetailedEmailError(email);
        setEmailError(detailedError);
      } else {
        setEmailError("");
      }
    }
  };

  const validateForm = () => {
    // Company-specific validation
    if (formData.role === "company") {
      if (!formData.companyName.trim()) {
        return "Company name is required";
      }
      if (!formData.companyDescription.trim()) {
        return "Company description is required";
      }
      if (!formData.companyIndustry.trim()) {
        return "Company industry is required";
      }
      if (!formData.email.trim()) {
        return "Email is required";
      }
      if (!validateEmail(formData.email.trim())) {
        const detailedError = getDetailedEmailError(formData.email.trim());
        setEmailError(detailedError);
        return detailedError;
      }
      if (formData.password.length < 6) {
        return "Password must be at least 6 characters long";
      }
      if (formData.password !== formData.confirmPassword) {
        return "Passwords do not match";
      }
      return null; // Valid company form
    }

    // User (Developer/Employer) validation
    if (!formData.name.trim()) {
      return "Full name is required";
    }
    if (!formData.email.trim()) {
      return "Email is required";
    }
    if (!validateEmail(formData.email.trim())) {
      const detailedError = getDetailedEmailError(formData.email.trim());
      setEmailError(detailedError);
      return detailedError;
    }
    if (formData.password.length < 6) {
      return "Password must be at least 6 characters long";
    }
    if (formData.password !== formData.confirmPassword) {
      return "Passwords do not match";
    }
    if (formData.role === "developer" && formData.skills.length === 0) {
      return "Please select at least one skill";
    }
    return null;
  };

  const checkUserExists = async (email) => {
    try {
      const response = await fetch(`/api/users?email=${email}`);
      const users = await response.json();
      return users.length > 0;
    } catch (error) {
      console.error("Error checking user existence:", error);
      return false;
    }
  };

  const checkCompanyExists = async (email) => {
    try {
      const response = await fetch(`/api/companies?email=${email}`);
      const companies = await response.json();
      return companies.length > 0;
    } catch (error) {
      console.error("Error checking company existence:", error);
      return false;
    }
  };

  const createCompany = async (companyData) => {
    try {
      const response = await fetch("/api/companies", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: Date.now().toString(),
          name: companyData.companyName,
          description: companyData.companyDescription,
          industry: companyData.companyIndustry,
          email: companyData.email,
          password: companyData.password,
          employerIds: [],
          isBeingEdited: false,
          editingBy: null,
          editingByName: null,
          editingStartTime: null,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create company");
      }

      return await response.json();
    } catch (error) {
      console.error("Error creating company:", error);
      throw error;
    }
  };

  const createUser = async (userData) => {
    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...userData,
          id: Date.now().toString(),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create user");
      }

      return await response.json();
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      setIsLoading(false);
      return;
    }

    try {
      // Handle company registration
      if (formData.role === "company") {
        const companyExists = await checkCompanyExists(formData.email.trim());
        if (companyExists) {
          setError("A company with this email already exists");
          setIsLoading(false);
          return;
        }

        await createCompany({
          companyName: formData.companyName,
          companyDescription: formData.companyDescription,
          companyIndustry: formData.companyIndustry,
          email: formData.email.trim(),
          password: formData.password,
        });

        setSuccess(true);
        setError("");
      } else {
        // Handle user registration (developer/employer)
        const userExists = await checkUserExists(formData.email.trim());
        if (userExists) {
          setError("An account with this email already exists");
          setIsLoading(false);
          return;
        }

        const {
          confirmPassword,
          companyName,
          companyDescription,
          companyIndustry,
          ...userDataToSave
        } = formData;
        userDataToSave.email = userDataToSave.email.trim();

        if (userDataToSave.role === "employer") {
          delete userDataToSave.skills;
        }

        await createUser(userDataToSave);

        setSuccess(true);
        setError("");
      }
    } catch (error) {
      setError("Failed to create account. Please try again.");
    }

    setIsLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl mb-6 shadow-lg">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              {formData.role === "company"
                ? "Company Registered Successfully!"
                : "Account Created Successfully!"}
            </h1>
            <p className="text-gray-600 mb-6">
              {formData.role === "company"
                ? "Your company has been registered. You can now sign in with your company credentials."
                : "Your account has been created. You can now sign in with your credentials."}
            </p>
            <Link
              to="/login"
              className="inline-flex items-center justify-center w-full py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
            >
              Go to Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl mb-4 shadow-lg">
            <Briefcase className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Create Account
          </h1>
          <p className="text-gray-600">Sign up for your Jobs App account</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Account Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Account Type
              </label>
              <div className="grid grid-cols-3 gap-3">
                <label className="relative">
                  <input
                    type="radio"
                    name="role"
                    value="developer"
                    checked={formData.role === "developer"}
                    onChange={handleInputChange}
                    className="sr-only"
                  />
                  <div
                    className={`p-3 rounded-lg border-2 cursor-pointer transition-colors duration-200 ${
                      formData.role === "developer"
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-300 bg-white hover:border-gray-400"
                    }`}
                  >
                    <div className="text-sm font-medium text-gray-900">
                      Developer
                    </div>
                    <div className="text-xs text-gray-500">Find jobs</div>
                  </div>
                </label>
                <label className="relative">
                  <input
                    type="radio"
                    name="role"
                    value="employer"
                    checked={formData.role === "employer"}
                    onChange={handleInputChange}
                    className="sr-only"
                  />
                  <div
                    className={`p-3 rounded-lg border-2 cursor-pointer transition-colors duration-200 ${
                      formData.role === "employer"
                        ? "border-indigo-500 bg-indigo-50"
                        : "border-gray-300 bg-white hover:border-gray-400"
                    }`}
                  >
                    <div className="text-sm font-medium text-gray-900">
                      Employer
                    </div>
                    <div className="text-xs text-gray-500">Hire talent</div>
                  </div>
                </label>
                <label className="relative">
                  <input
                    type="radio"
                    name="role"
                    value="company"
                    checked={formData.role === "company"}
                    onChange={handleInputChange}
                    className="sr-only"
                  />
                  <div
                    className={`p-3 rounded-lg border-2 cursor-pointer transition-colors duration-200 ${
                      formData.role === "company"
                        ? "border-purple-500 bg-purple-50"
                        : "border-gray-300 bg-white hover:border-gray-400"
                    }`}
                  >
                    <div className="text-sm font-medium text-gray-900">
                      Company
                    </div>
                    <div className="text-xs text-gray-500">Register</div>
                  </div>
                </label>
              </div>
            </div>

            {/* Company Fields */}
            {formData.role === "company" && (
              <>
                <div>
                  <label
                    htmlFor="companyName"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      Company Name
                    </div>
                  </label>
                  <input
                    id="companyName"
                    name="companyName"
                    type="text"
                    value={formData.companyName}
                    onChange={handleInputChange}
                    required
                    className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 placeholder-gray-400"
                    placeholder="Enter company name"
                  />
                </div>

                <div>
                  <label
                    htmlFor="companyDescription"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Company Description
                    </div>
                  </label>
                  <textarea
                    id="companyDescription"
                    name="companyDescription"
                    value={formData.companyDescription}
                    onChange={handleInputChange}
                    required
                    rows={3}
                    className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 placeholder-gray-400"
                    placeholder="Brief description of your company"
                  />
                </div>

                <div>
                  <label
                    htmlFor="companyIndustry"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Industry
                  </label>
                  <input
                    id="companyIndustry"
                    name="companyIndustry"
                    type="text"
                    value={formData.companyIndustry}
                    onChange={handleInputChange}
                    required
                    className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 placeholder-gray-400"
                    placeholder="e.g., Technology, Finance, Healthcare"
                  />
                </div>
              </>
            )}

            {/* User Name Field (not for company) */}
            {formData.role !== "company" && (
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 placeholder-gray-400"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                {formData.role === "company"
                  ? "Company Email"
                  : "Email Address"}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleEmailInput}
                  onBlur={handleEmailBlur}
                  required
                  className={`block w-full pl-10 pr-3 py-3 rounded-lg transition-colors duration-200 placeholder-gray-400 
                    ${
                      emailError
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500 bg-red-50"
                        : "border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    }`}
                  placeholder={
                    formData.role === "company"
                      ? "company@example.com"
                      : "Enter your email"
                  }
                />
                {emailError && (
                  <div className="flex items-center gap-2 mt-2 text-red-600">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    <span className="text-sm">{emailError}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Skills Selection (only for developers) */}
            {formData.role === "developer" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <Code className="h-4 w-4" />
                    Skills
                  </div>
                </label>

                {skillsError && (
                  <div className="flex items-center gap-2 p-3 mb-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    <span className="text-sm">{skillsError}</span>
                    <button
                      type="button"
                      onClick={fetchSkills}
                      className="ml-auto text-red-600 hover:text-red-800 underline text-sm"
                    >
                      Retry
                    </button>
                  </div>
                )}

                {formData.skills.length > 0 && (
                  <div className="mb-3">
                    <div className="text-xs text-gray-600 mb-2">
                      Selected skills:
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.skills.map((skillId) => (
                        <div
                          key={skillId}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-sm"
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

                <div className="border border-gray-300 rounded-lg p-3 max-h-40 overflow-y-auto">
                  {skillsLoading ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                      <span className="ml-2 text-sm text-gray-600">
                        Loading skills...
                      </span>
                    </div>
                  ) : availableSkills.length > 0 ? (
                    <div className="space-y-2">
                      {availableSkills.map((skill) => (
                        <label
                          key={skill.id}
                          className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                        >
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
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-sm text-gray-500">
                      No skills available
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 placeholder-gray-400"
                  placeholder="Create a password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                  className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 placeholder-gray-400"
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {/* Signup Button */}
            <button
              type="submit"
              disabled={
                isLoading ||
                emailError ||
                (formData.role === "developer" && skillsLoading)
              }
              className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {formData.role === "company"
                    ? "Registering Company..."
                    : "Creating Account..."}
                </>
              ) : formData.role === "company" ? (
                "Register Company"
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Already have an account?
                </span>
              </div>
            </div>

            <div className="mt-6">
              <Link
                to="/login"
                className="w-full flex items-center justify-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
              >
                Sign In Instead
              </Link>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-sm text-gray-500">
          By creating an account, you agree to our Terms of Service and Privacy
          Policy
        </p>
      </div>
    </div>
  );
};

export default Signup;
