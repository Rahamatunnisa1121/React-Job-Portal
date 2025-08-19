import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../contexts/AuthContext";

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

  const { user, isEmployer } = useAuth();
  const navigate = useNavigate();

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

  const validateEmail = (email) => {
    // Regular expression for email validation: string@string.string
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (e) => {
    const email = e.target.value;
    setContactEmail(email);

    // Clear error when user starts typing
    if (emailError) {
      setEmailError("");
    }
  };

  const submitForm = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validate email before submission
    if (!contactEmail) {
      setEmailError("Email is required");
      setIsSubmitting(false);
      return;
    }
    if (!validateEmail(contactEmail)) {
      setEmailError(
        "Please enter a valid email address (e.g., user@example.com)"
      );
      setIsSubmitting(false);
      return;
    }

    const newJob = {
      id: Date.now().toString(), // Simple ID generation
      title,
      type,
      location,
      description,
      salary,
      employerId: user.id, // Add the employer ID automatically
      company: {
        name: companyName,
        description: companyDescription,
        contactEmail,
        contactPhone,
      },
      createdAt: new Date().toISOString(), // Add timestamp
    };

    try {
      // Call the addJobSubmit function passed as prop
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
                <option value="$125K - 150K">$125K - $150K</option>
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
                className={`border rounded w-full py-2 px-3 ${
                  emailError ? "border-red-500 bg-red-50" : "border-gray-300"
                }`}
                placeholder="Email for applicants to contact"
                required
                value={contactEmail}
                onChange={handleEmailChange}
              />
              {emailError && (
                <p className="text-red-500 text-sm mt-1 font-medium">
                  {emailError}
                </p>
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
                disabled={isSubmitting}
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
