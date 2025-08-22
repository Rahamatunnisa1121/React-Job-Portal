import { useParams, useLoaderData, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaMapMarker } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from "../contexts/AuthContext";
import { useState } from "react";
import { FaBriefcase } from "react-icons/fa";
import { useEffect } from "react";


const JobPage = ({ deleteJob }) => {
  const {user, isDeveloper, isEmployer } = useAuth();
  const [isApplying, setIsApplying] = useState(false);
  const [applications, setApplications] = useState([]);
  const [alreadyApplied, setAlreadyApplied] = useState(false);
  const [showApplications, setShowApplications] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();
  const job = useLoaderData();//load the job navigated to
  
  useEffect(() => {
    const checkIfApplied = async () => {
      try {
        const response = await fetch("/api/applications");
        if (!response.ok) throw new Error("Failed to fetch applications");
        const data = await response.json();

        // ✅ check if this user already applied to this job
        const applied = data.some(
          (app) => app.jobId === job.id && app.applicantId === user.id
        );

        setAlreadyApplied(applied);
      } catch (error) {
        console.error("Error checking applications:", error);
      }
    };
    if (isDeveloper()) {
      checkIfApplied();
    }
  }, [job.id, user.id, isDeveloper]);

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
      const response = await fetch("/api/applications", {
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

  const handleApprove = async (applicationId) => {
    try {
      const response = await fetch(`/api/applications/${applicationId}`, {
        method: "PATCH", // or PUT depending on your API
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "approved" }), // ✅ tell backend to update
      });

      if (!response.ok) {
        throw new Error("Failed to approve application");
      }

      // parse updated application (if your API returns it)
      const updatedApp = await response.json();

      // ✅ Update UI
      setApplications((prev) =>
        prev.map((app) =>
          app.id === applicationId ? { ...app, status: "approved" } : app
        )
      );

      toast.success("Application approved!");
    } catch (error) {
      console.error("Error approving application:", error);
      toast.error("Could not approve application");
    }
  };
  const handleReject = async (applicationId) => {
    try {
      const response = await fetch(`/api/applications/${applicationId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "rejected" }),
      });

      if (!response.ok) {
        throw new Error("Failed to reject application");
      }

      setApplications((prev) =>
        prev.map((app) =>
          app.id === applicationId ? { ...app, status: "rejected" } : app
        )
      );

      toast.success("Application rejected!");
    } catch (error) {
      console.error("Error rejecting application:", error);
      toast.error("Could not reject application");
    }
  };

  const handleViewApplications = async () => {
    try {
      const response = await fetch(`/api/applications`);
      if (!response.ok) {
        throw new Error("Failed to fetch applications");
      }
      const data = await response.json();

      // filter applications for this job
      const filtered = data.filter((app) => app.jobId === job.id);

      setApplications(filtered);
      setShowApplications(true);
    } catch (error) {
      console.error("Error fetching applications:", error);
      toast.error("Could not load applications");
    }
  };

  const onDeleteClick = (jobId) => {
    const confirm = window.confirm(
      'Are you sure you want to delete this listing?'
    );

    if (!confirm) return;

    deleteJob(jobId);

    toast.success('Job deleted successfully');

    navigate('/jobs');
  };

  return (
    <>
      <section>
        <div className="container m-auto py-6 px-6">
          <Link
            to="/jobs"
            className="text-indigo-500 hover:text-indigo-600 flex items-center"
          >
            <FaArrowLeft className="mr-2" /> Back to Job Listings
          </Link>
        </div>
      </section>

      <section className="bg-indigo-50">
        <div className="container m-auto py-10 px-6">
          <div className="grid grid-cols-1 md:grid-cols-70/30 w-full gap-6">
            <main>
              <div className="bg-white p-6 rounded-lg shadow-md text-center md:text-left">
                <div className="text-gray-500 mb-4">{job.type}</div>
                <h1 className="text-3xl font-bold mb-4">{job.title}</h1>
                <div className="text-gray-500 mb-4 flex align-middle justify-center md:justify-start">
                  <FaMapMarker className="text-orange-700 mr-1" />
                  <p className="text-orange-700">{job.location}</p>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md mt-6">
                <h3 className="text-indigo-800 text-lg font-bold mb-6">
                  Job Description
                </h3>

                <p className="mb-4">{job.description}</p>

                <h3 className="text-indigo-800 text-lg font-bold mb-2">
                  Salary
                </h3>

                <p className="mb-4">{job.salary} / Year</p>
              </div>
              {/* {isDeveloper() && (
                <button
                  onClick={handleApply}
                  disabled={isApplying}
                  className="mt-6 w-full max-w-sm px-6 py-3 bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white font-semibold rounded-2xl shadow-md hover:shadow-lg text-base flex items-center justify-center gap-2 transition-all duration-300 disabled:cursor-not-allowed"
                >
                  <FaBriefcase className="text-lg" />
                  {isApplying ? "Applying..." : "Apply Now"}
                </button>
              )} */}
              {isDeveloper() && (
                <button
                  onClick={handleApply}
                  disabled={isApplying || alreadyApplied}
                  className="mt-6 w-full max-w-sm px-6 py-3 
               bg-green-500 hover:bg-green-600 
               disabled:bg-gray-400 text-white font-semibold 
               rounded-2xl shadow-md hover:shadow-lg 
               text-base flex items-center justify-center gap-2 
               transition-all duration-300 disabled:cursor-not-allowed"
                >
                  <FaBriefcase className="text-lg" />
                  {alreadyApplied
                    ? "Already Applied"
                    : isApplying
                    ? "Applying..."
                    : "Apply Now"}
                </button>
              )}
              {isEmployer() && (
                <button
                  onClick={handleViewApplications}
                  className="mt-6 w-full max-w-sm px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-2xl shadow-md hover:shadow-lg text-base flex items-center justify-center gap-2 transition-all duration-300"
                >
                  <FaBriefcase className="text-lg" />
                  View Applications
                </button>
              )}
              {showApplications && (
                <div className="bg-white p-8 rounded-2xl shadow-lg mt-8 border border-gray-100">
                  <h3 className="text-indigo-700 text-xl font-semibold mb-6 flex items-center">
                    Applications
                  </h3>
                  {applications.length > 0 ? (
                    <ul className="space-y-5">
                      {applications.map((app) => (
                        <li
                          key={app.id}
                          className="border border-gray-200 p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow bg-gray-50"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-lg font-semibold text-gray-800">
                                {app.applicantName}
                              </p>
                              <p className="text-gray-600 text-sm">
                                {app.applicantEmail}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                Applied at:{" "}
                                {new Date(app.appliedAt).toLocaleString()}
                              </p>
                              <p className="mt-2 text-sm">
                                Status:{" "}
                                <span
                                  className={
                                    app.status === "approved"
                                      ? "text-green-600 font-semibold"
                                      : app.status === "rejected"
                                      ? "text-red-600 font-semibold"
                                      : "text-yellow-600"
                                  }
                                >
                                  {app.status}
                                </span>
                              </p>
                            </div>
                            {app.status === "pending" && (
                              <div className="flex gap-2 mt-2">
                                <button
                                  onClick={() => handleApprove(app.id)}
                                  className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg shadow-md transition-all"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleReject(app.id)}
                                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg shadow-md transition-all"
                                >
                                  Reject
                                </button>
                              </div>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500 text-sm">
                      No applications yet.
                    </p>
                  )}
                </div>
              )}
            </main>

            {/* <!-- Sidebar --> */}
            <aside>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-bold mb-6">Company Info</h3>

                <h2 className="text-2xl">{job.company.name}</h2>

                <p className="my-2">{job.company.description}</p>

                <hr className="my-4" />

                <h3 className="text-xl">Contact Email:</h3>

                <p className="my-2 bg-indigo-100 p-2 font-bold">
                  {job.company.contactEmail}
                </p>

                <h3 className="text-xl">Contact Phone:</h3>

                <p className="my-2 bg-indigo-100 p-2 font-bold">
                  {" "}
                  {job.company.contactPhone}
                </p>
              </div>

              {isEmployer() && (
                <div className="bg-white p-6 rounded-lg shadow-md mt-6">
                  <h3 className="text-xl font-bold mb-6">Manage Job</h3>
                  <Link
                    to={`/edit-job/${job.id}`}
                    className="bg-indigo-500 hover:bg-indigo-600 text-white text-center font-bold py-2 px-4 rounded-full w-full focus:outline-none focus:shadow-outline mt-4 block"
                  >
                    Edit Job
                  </Link>
                  <button
                    onClick={() => onDeleteClick(job.id)}
                    className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-full w-full focus:outline-none focus:shadow-outline mt-4 block"
                  >
                    Delete Job
                  </button>
                </div>
              )}
            </aside>
          </div>
        </div>
      </section>
    </>
  );
};

// React Router calls this before rendering JobPage. It fetches one job by id.
const jobLoader = async ({ params }) => {
  const res = await fetch(`/api/jobs/${params.id}`);
  const data = await res.json();
  return data;
};

export { JobPage as default, jobLoader };
