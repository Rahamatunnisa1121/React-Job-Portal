import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../contexts/AuthContext";
import { AlertCircle, X, Search } from "lucide-react";

const AddJobPage = ({ addJobSubmit }) => {
  const [title, setTitle] = useState("");
  const [type, setType] = useState("Full-Time");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [salary, setSalary] = useState("Under $50K");
  const [companyName, setCompanyName] = useState("");
  const [companyDescription, setCompanyDescription] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [emailError, setEmailError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Skills state
  const [allSkills, setAllSkills] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [skillSearchTerm, setSkillSearchTerm] = useState("");
  const [showSkillDropdown, setShowSkillDropdown] = useState(false);
  const [isLoadingSkills, setIsLoadingSkills] = useState(true);

  const { user, isEmployer } = useAuth();
  const navigate = useNavigate();

  // Fetch all available skills on component mount
  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const response = await fetch("/api/skills");
        const skillsData = await response.json();
        setAllSkills(skillsData);
      } catch (error) {
        console.error("Error fetching skills:", error);
        toast.error("Failed to load skills");
      } finally {
        setIsLoadingSkills(false);
      }
    };

    fetchSkills();
  }, []);

  // Redirect if not an employer (extra security check)
  if (!isEmployer()) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h3 className="text-lg font-semibold text-red-800 mb-2">
            Access Denied
          </h3>
          <p className="text-red-600">Only employers can add jobs.</p>
        </div>
      </div>
    );
  }

  // Filter skills based on search term and exclude already selected
  const filteredSkills = allSkills.filter(
    (skill) =>
      skill.name.toLowerCase().includes(skillSearchTerm.toLowerCase()) &&
      !selectedSkills.some((selected) => selected.id === skill.id)
  );

  // Add skill to selected list
  const handleAddSkill = (skill) => {
    setSelectedSkills([...selectedSkills, skill]);
    setSkillSearchTerm("");
    setShowSkillDropdown(false);
  };

  // Remove skill from selected list
  const handleRemoveSkill = (skillId) => {
    setSelectedSkills(selectedSkills.filter((skill) => skill.id !== skillId));
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
    const email = contactEmail.trim();

    if (email === "") {
      setEmailError("");
      return;
    }

    const detailedError = getDetailedEmailError(email);
    setEmailError(detailedError);
  };

  const handleEmailChange = (e) => {
    const email = e.target.value;
    setContactEmail(email);

    if (emailError || email.trim().length > 0) {
      const trimmedEmail = email.trim();

      if (trimmedEmail.length > 0) {
        const detailedError = getDetailedEmailError(trimmedEmail);
        setEmailError(detailedError);
      } else {
        setEmailError("");
      }
    }
  };

  const submitForm = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!contactEmail.trim()) {
      setEmailError("Email is required");
      setIsSubmitting(false);
      return;
    }

    const detailedError = getDetailedEmailError(contactEmail.trim());
    if (detailedError) {
      setEmailError(detailedError);
      setIsSubmitting(false);
      return;
    }

    const newJob = {
      id: Date.now().toString(),
      title,
      type,
      location,
      description,
      salary,
      employerId: user.id,
      skills: selectedSkills.map((skill) => skill.id), // Add selected skill IDs
      company: {
        name: companyName,
        description: companyDescription,
        contactEmail: contactEmail.trim(),
        contactPhone,
      },
      createdAt: new Date().toISOString(),
    };

    try {
      await addJobSubmit(newJob);
      toast.success("Job Added Successfully");
      navigate("/jobs");
    } catch (error) {
      console.error("Error adding job:", error);
      toast.error("Error adding job. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="bg-indigo-50">
      <div className="container m-auto max-w-2xl py-24">
        <div className="bg-white px-6 py-8 mb-4 shadow-md rounded-md border m-4 md:m-0">
          {/* User info header */}
          <div className="bg-indigo-50 rounded-lg p-4 mb-6 border border-indigo-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-indigo-800">
                  Posting as:
                </h3>
                <p className="text-indigo-600">
                  {user.name} ({user.email})
                </p>
              </div>
              <div className="bg-indigo-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                Employer
              </div>
            </div>
          </div>

          <form onSubmit={submitForm}>
            <h2 className="text-3xl text-center font-semibold mb-6">Add Job</h2>

            <div className="mb-4">
              <label
                htmlFor="type"
                className="block text-gray-700 font-bold mb-2"
              >
                Job Type
              </label>
              <select
                id="type"
                name="type"
                className="border rounded w-full py-2 px-3"
                required
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                <option value="Full-Time">Full-Time</option>
                <option value="Part-Time">Part-Time</option>
                <option value="Remote">Remote</option>
                <option value="Internship">Internship</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 font-bold mb-2">
                Job Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                className="border rounded w-full py-2 px-3 mb-2"
                placeholder="e.g. Frontend Developer, Data Scientist"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="description"
                className="block text-gray-700 font-bold mb-2"
              >
                Job Description *
              </label>
              <textarea
                id="description"
                name="description"
                className="border rounded w-full py-2 px-3"
                rows="6"
                placeholder="Add job duties, expectations, requirements, benefits, etc."
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              ></textarea>
              <p className="text-sm text-gray-500 mt-1">
                Provide detailed information to attract the right candidates
              </p>
            </div>

            {/* Required Skills Section */}
            <div className="mb-4">
              <label className="block text-gray-700 font-bold mb-2">
                Required Skills
              </label>
              <div className="relative">
                <div className="flex items-center border rounded px-3 py-2 bg-white">
                  <Search className="h-4 w-4 text-gray-400 mr-2" />
                  <input
                    type="text"
                    className="w-full outline-none"
                    placeholder="Search and add skills (e.g., React, JavaScript)"
                    value={skillSearchTerm}
                    onChange={(e) => {
                      setSkillSearchTerm(e.target.value);
                      setShowSkillDropdown(true);
                    }}
                    onFocus={() => setShowSkillDropdown(true)}
                  />
                </div>

                {/* Skills Dropdown */}
                {showSkillDropdown && skillSearchTerm && (
                  <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {isLoadingSkills ? (
                      <div className="p-4 text-center text-gray-500">
                        Loading skills...
                      </div>
                    ) : filteredSkills.length > 0 ? (
                      filteredSkills.map((skill) => (
                        <button
                          key={skill.id}
                          type="button"
                          className="w-full text-left px-4 py-2 hover:bg-indigo-50 transition-colors"
                          onClick={() => handleAddSkill(skill)}
                        >
                          {skill.name}
                        </button>
                      ))
                    ) : (
                      <div className="p-4 text-center text-gray-500">
                        No skills found
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Selected Skills Display */}
              {selectedSkills.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {selectedSkills.map((skill) => (
                    <span
                      key={skill.id}
                      className="inline-flex items-center gap-1 bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium"
                    >
                      {skill.name}
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill.id)}
                        className="hover:bg-indigo-200 rounded-full p-0.5 transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <p className="text-sm text-gray-500 mt-2">
                Add skills to help match with qualified candidates (
                {selectedSkills.length} selected)
              </p>
            </div>

            <div className="mb-4">
              <label
                htmlFor="salary"
                className="block text-gray-700 font-bold mb-2"
              >
                Salary Range *
              </label>
              <select
                id="salary"
                name="salary"
                className="border rounded w-full py-2 px-3"
                required
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
              >
                <option value="Under $50K">Under $50K</option>
                <option value="$50K - 60K">$50K - $60K</option>
                <option value="$60K - 70K">$60K - $70K</option>
                <option value="$70K - 80K">$70K - $80K</option>
                <option value="$80K - 90K">$80K - $90K</option>
                <option value="$90K - 100K">$90K - $100K</option>
                <option value="$100K - 125K">$100K - $125K</option>
                <option value="$125K - 150K">$125K - $125K</option>
                <option value="$150K - 175K">$150K - $175K</option>
                <option value="$175K - 200K">$175K - $200K</option>
                <option value="Over $200K">Over $200K</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 font-bold mb-2">
                Location *
              </label>
              <input
                type="text"
                id="location"
                name="location"
                className="border rounded w-full py-2 px-3 mb-2"
                placeholder="e.g. New York, NY or Remote"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            <hr className="my-6" />
            <h3 className="text-2xl mb-5">Company Information</h3>

            <div className="mb-4">
              <label
                htmlFor="company"
                className="block text-gray-700 font-bold mb-2"
              >
                Company Name *
              </label>
              <input
                type="text"
                id="company"
                name="company"
                className="border rounded w-full py-2 px-3"
                placeholder="Your Company Name"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="company_description"
                className="block text-gray-700 font-bold mb-2"
              >
                Company Description
              </label>
              <textarea
                id="company_description"
                name="company_description"
                className="border rounded w-full py-2 px-3"
                rows="4"
                placeholder="What does your company do? Company culture, mission, etc."
                value={companyDescription}
                onChange={(e) => setCompanyDescription(e.target.value)}
              ></textarea>
            </div>

            <div className="mb-4">
              <label
                htmlFor="contact_email"
                className="block text-gray-700 font-bold mb-2"
              >
                Contact Email *
              </label>
              <input
                type="email"
                id="contact_email"
                name="contact_email"
                className={`border rounded w-full py-2 px-3 transition-colors duration-200 ${
                  emailError
                    ? "border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                }`}
                placeholder="Email for applicants to contact"
                required
                value={contactEmail}
                onChange={handleEmailChange}
                onBlur={handleEmailBlur}
              />
              {emailError && (
                <div className="flex items-center gap-2 mt-2 text-red-600">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span className="text-sm font-medium">{emailError}</span>
                </div>
              )}
            </div>

            <div className="mb-6">
              <label
                htmlFor="contact_phone"
                className="block text-gray-700 font-bold mb-2"
              >
                Contact Phone
              </label>
              <input
                type="tel"
                id="contact_phone"
                name="contact_phone"
                className="border rounded w-full py-2 px-3"
                placeholder="Optional phone number for applicants"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
              />
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-full w-full focus:outline-none focus:shadow-outline"
              >
                Cancel
              </button>
              <button
                className="bg-indigo-500 hover:bg-indigo-600 disabled:bg-indigo-300 text-white font-bold py-2 px-4 rounded-full w-full focus:outline-none focus:shadow-outline disabled:cursor-not-allowed"
                type="submit"
                disabled={isSubmitting || emailError}
              >
                {isSubmitting ? "Adding Job..." : "Add Job"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default AddJobPage;
