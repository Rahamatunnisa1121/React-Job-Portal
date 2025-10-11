import { useParams, useLoaderData, useNavigate, Link } from "react-router-dom";
import { FaArrowLeft, FaMapMarker, FaBriefcase } from "react-icons/fa";
import { toast } from "react-toastify";
import { useAuth } from "../contexts/AuthContext";
import { useState, useEffect } from "react";
import { Video, FileText } from "lucide-react";
import defaultProfile from "../assets/images/profilephoto.jpg";

const JobPage = ({ deleteJob }) => {
  const { user, isDeveloper, isEmployer } = useAuth();
  const [isApplying, setIsApplying] = useState(false);
  const [applications, setApplications] = useState([]);
  const [alreadyApplied, setAlreadyApplied] = useState(false);
  const [showApplications, setShowApplications] = useState(false);
  const [loadingApplications, setLoadingApplications] = useState(false);

  const navigate = useNavigate();
  const { id } = useParams();
  const job = useLoaderData();

  // ✅ Check if already applied
  useEffect(() => {
    const checkIfApplied = async () => {
      try {
        const response = await fetch("/api/applications");
        if (!response.ok) throw new Error("Failed to fetch applications");
        const data = await response.json();

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

  // ✅ Apply to job - NOW INCLUDES RESUME
  const handleApply = async (e) => {
    e.preventDefault();
    setIsApplying(true);

    const applicationData = {
      jobId: job.id,
      applicantId: user.id,
      applicantName: user.name,
      applicantEmail: user.email,
      appliedAt: new Date().toISOString(),
      profile: user.profileImageUrl,
      video: user.introVideoUrl,
      resume: user.resumeUrl, // ✅ ADDED RESUME
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
        setAlreadyApplied(true);
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

  const handleViewCompany = () => {
    if (job?.employerId) {
      navigate(`/employer/${job.employerId}`);
    }
  };

  // ✅ Approve / Reject
  const handleApprove = async (applicationId) => {
    try {
      const response = await fetch(`/api/applications/${applicationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "approved" }),
      });

      if (!response.ok) throw new Error("Failed to approve application");

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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "rejected" }),
      });

      if (!response.ok) throw new Error("Failed to reject application");

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

  // ✅ Load applications - NOW INCLUDES RESUME
  const handleViewApplications = async () => {
    try {
      setLoadingApplications(true);

      const applicationsResponse = await fetch(`/api/applications`);
      if (!applicationsResponse.ok)
        throw new Error("Failed to fetch applications");
      const applicationsData = await applicationsResponse.json();

      const filteredApplications = applicationsData.filter(
        (app) => app.jobId === job.id
      );

      const skillsResponse = await fetch(`/api/skills`);
      if (!skillsResponse.ok) throw new Error("Failed to fetch skills");
      const skillsData = await skillsResponse.json();

      const usersResponse = await fetch(`/api/users`);
      if (!usersResponse.ok) throw new Error("Failed to fetch users");
      const usersData = await usersResponse.json();

      const skillsMap = skillsData.reduce((map, skill) => {
        map[skill.id] = skill.name;
        return map;
      }, {});

      const usersMap = usersData.reduce((map, user) => {
        map[user.id] = user;
        return map;
      }, {});

      // ✅ Merge missing profile + video + RESUME from user
      const applicationsWithSkills = filteredApplications.map((application) => {
        const applicant = usersMap[application.applicantId];

        if (!applicant) {
          return {
            ...application,
            applicantSkills: [],
            profile: "",
            video: "",
            resume: "", // ✅ ADDED
          };
        }

        const applicantSkillNames =
          applicant.skills
            ?.map((skillId) => skillsMap[skillId])
            .filter(Boolean) || [];

        return {
          ...application,
          applicantSkills: applicantSkillNames,
          profile: application.profile || applicant.profileImageUrl,
          video: application.video || applicant.introVideoUrl,
          resume: application.resume || applicant.resumeUrl, // ✅ ADDED
        };
      });

      console.log("Applications with skills:", applicationsWithSkills);

      setApplications(applicationsWithSkills);
      setShowApplications(true);
    } catch (error) {
      console.error("Error fetching applications:", error);
      toast.error("Could not load applications");
    } finally {
      setLoadingApplications(false);
    }
  };

  // ✅ Delete job
  const onDeleteClick = (jobId) => {
    if (!window.confirm("Are you sure you want to delete this listing?"))
      return;
    deleteJob(jobId);
    toast.success("Job deleted successfully");
    navigate("/jobs");
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
              {/* ✅ Job details */}
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

              {/* ✅ Apply / View Applications */}
              {isDeveloper() && (
                <>
                  <div className="mt-6 flex flex-wrap gap-3">
                    {/* Apply Now Button */}
                    <button
                      onClick={handleApply}
                      disabled={isApplying || alreadyApplied}
                      className="flex-1 min-w-[150px] px-6 py-3 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-semibold rounded-xl shadow-md hover:shadow-lg text-base flex items-center justify-center gap-2 transition-all duration-300 disabled:cursor-not-allowed"
                    >
                      <FaBriefcase className="text-lg" />
                      {alreadyApplied
                        ? "Already Applied"
                        : isApplying
                        ? "Applying..."
                        : "Apply Now"}
                    </button>

                    {/* View Company Button */}
                    <button
                      onClick={handleViewCompany}
                      className="flex-1 min-w-[150px] px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl shadow-md hover:shadow-lg text-base flex items-center justify-center gap-2 transition-all duration-300"
                    >
                      View Company
                    </button>
                  </div>
                </>
              )}

              {isEmployer() && (
                <button
                  onClick={handleViewApplications}
                  disabled={loadingApplications}
                  className="mt-6 w-full max-w-sm px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-semibold rounded-2xl shadow-md hover:shadow-lg text-base flex items-center justify-center gap-2 transition-all duration-300"
                >
                  <FaBriefcase className="text-lg" />
                  {loadingApplications ? "Loading..." : "View Applications"}
                </button>
              )}

              {/* ✅ Applications list - NOW WITH RESUME BUTTON */}
              {showApplications && (
                <div className="bg-white p-8 rounded-2xl shadow-lg mt-8 border border-gray-100">
                  <h3 className="text-indigo-700 text-xl font-semibold mb-6 flex items-center">
                    Applications ({applications.length})
                  </h3>
                  {applications.length > 0 ? (
                    <ul className="space-y-5">
                      {applications.map((app) => (
                        <li
                          key={app.id}
                          className="border border-gray-200 p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow bg-gray-50"
                        >
                          <div className="flex justify-between items-start">
                            {/* ✅ Left section */}
                            <div className="flex gap-4 items-start">
                              <img
                                src={app.profile || defaultProfile}
                                alt={app.applicantName}
                                className="w-14 h-14 rounded-full object-cover border-2 border-gray-200"
                              />
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
                                        : "text-yellow-600 font-semibold"
                                    }
                                  >
                                    {app.status}
                                  </span>
                                </p>

                                {app.applicantSkills?.length > 0 && (
                                  <div className="mt-3">
                                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                                      Skills:
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                      {app.applicantSkills.map(
                                        (skill, index) => (
                                          <span
                                            key={index}
                                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                          >
                                            {skill}
                                          </span>
                                        )
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* ✅ Right section - Media & Actions */}
                            <div className="flex flex-col items-end gap-3">
                              {/* ✅ Media buttons - VIDEO & RESUME */}
                              <div className="flex gap-2">
                                {app.video && (
                                  <a
                                    href={app.video}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1 px-3 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg transition-all shadow-sm hover:shadow-md"
                                    title="View Introduction Video"
                                  >
                                    <Video className="w-4 h-4" />
                                    <span className="text-sm font-medium">
                                      Video
                                    </span>
                                  </a>
                                )}

                                {app.resume && (
                                  <a
                                    href={app.resume}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1 px-3 py-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg transition-all shadow-sm hover:shadow-md"
                                    title="View Resume/CV"
                                  >
                                    <FileText className="w-4 h-4" />
                                    <span className="text-sm font-medium">
                                      Resume
                                    </span>
                                  </a>
                                )}
                              </div>

                              {/* Action buttons */}
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
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                      <p className="text-gray-500 text-sm">
                        No applications yet.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </main>

            {/* ✅ Sidebar */}
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
                  {job.company.contactPhone}
                </p>
              </div>

              {isEmployer() && (
                <div className="bg-white p-6 rounded-lg shadow-md mt-6">
                  <h3 className="text-xl font-bold mb-6">Manage Job</h3>
                  <Link
                    to={`/edit-job/${job.id}`}
                    className="bg-indigo-500 hover:bg-indigo-600 text-white text-center font-bold py-2 px-4 rounded-full w-full block"
                  >
                    Edit Job
                  </Link>
                  <button
                    onClick={() => onDeleteClick(job.id)}
                    className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-full w-full mt-4 block"
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

const jobLoader = async ({ params }) => {
  const res = await fetch(`/api/jobs/${params.id}`);
  const data = await res.json();
  return data;
};

export { JobPage as default, jobLoader };
