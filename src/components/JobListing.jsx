import { useState } from "react";
import { FaMapMarker, FaEdit, FaTrash, FaBriefcase } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const JobListing = ({ job }) => {
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { user, isDeveloper, isEmployer, canEditJob } = useAuth();
  const navigate = useNavigate();

  let description = job.description;

  if (!showFullDescription) {
    description = description.substring(0, 90) + "...";
  }

  const handleApply = async (e) => {
    e.preventDefault();
    setIsApplying(true);

    const applicationData = {
      jobId: job.id,
      applicantId: user.id,
      applicantName: user.name,
      applicantEmail: user.email,
      appliedAt: new Date().toISOString(),
      status: "pending",
    };

    try {
      const response = await fetch("http://localhost:8000/applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(applicationData),
      });

      if (response.ok) {
        alert("Application submitted successfully!");
      } else {
        alert("Error submitting application. Please try again.");
      }
    } catch (error) {
      console.error("Error applying to job:", error);
      alert("Error submitting application. Please try again.");
    } finally {
      setIsApplying(false);
    }
  };

  const handleDelete = async (e) => {
    e.preventDefault();

    if (
      !window.confirm(
        "Are you sure you want to delete this job? This action cannot be undone."
      )
    ) {
      return;
    }

    setIsDeleting(true);

    try {
      const response = await fetch(`http://localhost:8000/jobs/${job.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        alert("Job deleted successfully!");
        // Refresh the page to update the job list
        window.location.reload();
      } else {
        alert("Error deleting job. Please try again.");
      }
    } catch (error) {
      console.error("Error deleting job:", error);
      alert("Error deleting job. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md relative">
      {/* Role indicator badge */}
      {isEmployer() && canEditJob(job) && (
        <div className="absolute top-3 right-3">
          <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
            Your Job
          </span>
        </div>
      )}

      <div className="p-4">
        <div className="mb-6">
          <div className="text-gray-600 my-2">{job.type}</div>
          <h3 className="text-xl font-bold">{job.title}</h3>
          <p className="text-gray-600 text-sm mt-1">{job.company?.name}</p>
        </div>

        <div className="mb-5">{description}</div>

        <button
          onClick={() => setShowFullDescription((prevState) => !prevState)}
          className="text-indigo-500 mb-5 hover:text-indigo-600"
        >
          {showFullDescription ? "Less" : "More"}
        </button>

        <h3 className="text-indigo-500 mb-2">{job.salary} / Year</h3>

        <div className="border border-gray-100 mb-5"></div>

        <div className="flex flex-col lg:flex-row justify-between mb-4">
          <div className="text-orange-700 mb-3">
            <FaMapMarker className="inline text-lg mb-1 mr-1" />
            {job.location}
          </div>

          {/* Action buttons based on user role */}
          <div className="flex flex-col sm:flex-row gap-2">
            {/* View Details - Everyone */}
            <Link
              to={`/jobs/${job.id}`}
              className="h-[36px] bg-gray-500 hover:bg-gray-600 text-white px-3 py-2 rounded-lg text-center text-sm flex items-center justify-center"
            >
              View Details
            </Link>

            {/* Apply Button - Only for Developers */}
            {isDeveloper() && (
              <button
                onClick={handleApply}
                disabled={isApplying}
                className="h-[36px] bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white px-3 py-2 rounded-lg text-sm flex items-center justify-center gap-1 disabled:cursor-not-allowed"
              >
                <FaBriefcase className="text-xs" />
                {isApplying ? "Applying..." : "Apply"}
              </button>
            )}

            {/* Edit Button - Only for Job Owner (Employer) */}
            {isEmployer() && canEditJob(job) && (
              <Link
                to={`/edit-job/${job.id}`}
                className="h-[36px] bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-2 rounded-lg text-center text-sm flex items-center justify-center gap-1"
              >
                <FaEdit className="text-xs" />
                Edit
              </Link>
            )}

            {/* Delete Button - Only for Job Owner (Employer) */}
            {isEmployer() && canEditJob(job) && (
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="h-[36px] bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white px-3 py-2 rounded-lg text-sm flex items-center justify-center gap-1 disabled:cursor-not-allowed"
              >
                <FaTrash className="text-xs" />
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            )}
          </div>
        </div>

        {/* Additional info for employers */}
        {canEditJob(job) && (
          <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              <strong>Job ID:</strong> {job.id} |
              <strong className="ml-2">Posted by:</strong> You
            </p>
          </div>
        )}

        {/* Info for developers */}
        {isDeveloper() && (
          <div className="mt-3 text-sm text-gray-500">
            Posted by: {job.company?.name}
          </div>
        )}
      </div>
    </div>
  );
};

export default JobListing;
