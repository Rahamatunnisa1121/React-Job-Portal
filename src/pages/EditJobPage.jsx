import { useState, useEffect } from "react";
import { useParams, useNavigate, useLoaderData } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../contexts/AuthContext";

const EditJobPage = ({ updateJobSubmit }) => {
  const job = useLoaderData(); // Get job data from loader
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isEmployer, canEditJob } = useAuth();

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
  const [loading, setLoading] = useState(true);

  // Initialize form with job data
  useEffect(() => {
    if (job) {
      setTitle(job.title || "");
      setType(job.type || "Full-Time");
      setLocation(job.location || "");
      setDescription(job.description || "");
      setSalary(job.salary || "Under $50K");
      setCompanyName(job.company?.name || "");
      setCompanyDescription(job.company?.description || "");
      setContactEmail(job.company?.contactEmail || "");
      setContactPhone(job.company?.contactPhone || "");
      setLoading(false);
    }
  }, [job]);

  // Security check: Only job owner can edit
  if (!loading && (!isEmployer() || !canEditJob(job))) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center max-w-md mx-auto">
          <h3 className="text-lg font-semibold text-red-800 mb-2">
            Access Denied
          </h3>
          <p className="text-red-600 mb-4">
            {!isEmployer()
              ? "Only employers can edit jobs."
              : "You can only edit jobs that you have posted."}
          </p>
          <button
            onClick={() => navigate(-1)}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="text-xl">Loading job details...</div>
        </div>
      </div>
    );
  }

  const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (e) => {
    const email = e.target.value;
    setContactEmail(email);

    if (emailError) {
      setEmailError("");
    }
  };

  const submitForm = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validate email
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

    const updatedJob = {
      id: job.id,
      title,
      type,
      location,
      description,
      salary,
      employerId: job.employerId, // Keep original employer ID
      company: {
        name: companyName,
        description: companyDescription,
        contactEmail,
        contactPhone,
      },
      createdAt: job.createdAt, // Keep original creation date
      updatedAt: new Date().toISOString(), // Add update timestamp
    };

    try {
      await updateJobSubmit(updatedJob);
      toast.success("Job Updated Successfully");
      navigate(`/jobs/${job.id}`);
    } catch (error) {
      console.error("Error updating job:", error);
      toast.error("Error updating job. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="bg-indigo-50">
      <div className="container m-auto max-w-2xl py-24">
        <div className="bg-white px-6 py-8 mb-4 shadow-md rounded-md border m-4 md:m-0">
          {/* Job info header */}
          <div className="bg-amber-50 rounded-lg p-4 mb-6 border border-amber-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-amber-800">
                  Editing Job:
                </h3>
                <p className="text-amber-700 font-medium">{job.title}</p>
                <p className="text-amber-600 text-sm">Job ID: {job.id}</p>
              </div>
              <div className="bg-amber-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                Your Job
              </div>
            </div>
          </div>

          <form onSubmit={submitForm}>
            <h2 className="text-3xl text-center font-semibold mb-6">
              Edit Job
            </h2>

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

            {/* Job metadata */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-sm text-gray-600">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div>
                  <strong>Job ID:</strong> {job.id}
                </div>
                <div>
                  <strong>Posted by:</strong> {user.name}
                </div>
                {job.createdAt && (
                  <div>
                    <strong>Created:</strong>{" "}
                    {new Date(job.createdAt).toLocaleDateString()}
                  </div>
                )}
                {job.updatedAt && (
                  <div>
                    <strong>Last updated:</strong>{" "}
                    {new Date(job.updatedAt).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => navigate(`/jobs/${job.id}`)}
                className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-full w-full focus:outline-none focus:shadow-outline"
              >
                Cancel
              </button>
              <button
                className="bg-indigo-500 hover:bg-indigo-600 disabled:bg-indigo-300 text-white font-bold py-2 px-4 rounded-full w-full focus:outline-none focus:shadow-outline disabled:cursor-not-allowed"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Updating Job..." : "Update Job"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default EditJobPage;
