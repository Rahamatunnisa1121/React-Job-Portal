import { useParams, useLoaderData, useNavigate, Link } from "react-router-dom";
import { FaArrowLeft, FaMapMarker, FaBriefcase } from "react-icons/fa";
import { toast } from "react-toastify";
import { useAuth } from "../contexts/AuthContext";
import { useState, useEffect } from "react";
import { Video, FileText, User, X, Download } from "lucide-react";
import defaultProfile from "../assets/images/profilephoto.jpg";

const JobPage = ({ deleteJob }) => {
  const { user, isDeveloper, isEmployer } = useAuth();
  const [isApplying, setIsApplying] = useState(false);
  const [applications, setApplications] = useState([]);
  const [alreadyApplied, setAlreadyApplied] = useState(false);
  const [showApplications, setShowApplications] = useState(false);
  const [loadingApplications, setLoadingApplications] = useState(false);
  const [expandedAboutMe, setExpandedAboutMe] = useState({});

  // ✅ Modal states
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [currentVideoUrl, setCurrentVideoUrl] = useState("");
  const [currentResumeUrl, setCurrentResumeUrl] = useState("");
  const [currentApplicantName, setCurrentApplicantName] = useState("");

  const navigate = useNavigate();
  const { id } = useParams();
  const job = useLoaderData();

  // ✅ Close modal on ESC key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") {
        setShowVideoModal(false);
        setShowResumeModal(false);
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

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

  // ✅ Open Video Modal
  const openVideoModal = (videoUrl, applicantName) => {
    setCurrentVideoUrl(videoUrl);
    setCurrentApplicantName(applicantName);
    setShowVideoModal(true);
    document.body.style.overflow = "hidden"; // Prevent background scroll
  };

  // ✅ Close Video Modal
  const closeVideoModal = () => {
    setShowVideoModal(false);
    setCurrentVideoUrl("");
    document.body.style.overflow = "auto";
  };

  // ✅ Open Resume Modal
  const openResumeModal = (resumeUrl, applicantName) => {
    setCurrentResumeUrl(resumeUrl);
    setCurrentApplicantName(applicantName);
    setShowResumeModal(true);
    document.body.style.overflow = "hidden";
  };

  // ✅ Close Resume Modal
  const closeResumeModal = () => {
    setShowResumeModal(false);
    setCurrentResumeUrl("");
    document.body.style.overflow = "auto";
  };

  // ✅ Apply to job
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
      resume: user.resumeUrl,
      aboutMe: user.aboutMe,
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

  // ✅ Toggle About Me expansion
  const toggleAboutMe = (appId) => {
    setExpandedAboutMe((prev) => ({
      ...prev,
      [appId]: !prev[appId],
    }));
  };

  // ✅ Load applications
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

      const applicationsWithSkills = filteredApplications.map((application) => {
        const applicant = usersMap[application.applicantId];

        if (!applicant) {
          return {
            ...application,
            applicantSkills: [],
            profile: "",
            video: "",
            resume: "",
            aboutMe: "",
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
          resume: application.resume || applicant.resumeUrl,
          aboutMe: application.aboutMe || applicant.aboutMe,
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

              {/* ✅ Applications list */}
              {showApplications && (
                <div className="bg-white p-8 rounded-2xl shadow-lg mt-8 border border-gray-100">
                  <h3 className="text-indigo-700 text-xl font-semibold mb-6 flex items-center">
                    Applications ({applications.length})
                  </h3>
                  {applications.length > 0 ? (
                    <ul className="space-y-6">
                      {applications.map((app) => (
                        <li
                          key={app.id}
                          className="border border-gray-200 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow bg-gray-50"
                        >
                          <div className="flex flex-col gap-4">
                            {/* ✅ Top section */}
                            <div className="flex justify-between items-start">
                              <div className="flex gap-4 items-start">
                                <img
                                  src={app.profile || defaultProfile}
                                  alt={app.applicantName}
                                  className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
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
                                </div>
                              </div>

                              {/* ✅ Media buttons - NOW OPENS MODAL */}
                              <div className="flex gap-2">
                                {app.video && (
                                  <button
                                    onClick={() =>
                                      openVideoModal(
                                        app.video,
                                        app.applicantName
                                      )
                                    }
                                    className="flex items-center gap-1 px-3 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg transition-all shadow-sm hover:shadow-md"
                                    title="View Introduction Video"
                                  >
                                    <Video className="w-4 h-4" />
                                    <span className="text-sm font-medium">
                                      Video
                                    </span>
                                  </button>
                                )}

                                {app.resume && (
                                  <button
                                    onClick={() =>
                                      openResumeModal(
                                        app.resume,
                                        app.applicantName
                                      )
                                    }
                                    className="flex items-center gap-1 px-3 py-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg transition-all shadow-sm hover:shadow-md"
                                    title="View Resume/CV"
                                  >
                                    <FileText className="w-4 h-4" />
                                    <span className="text-sm font-medium">
                                      Resume
                                    </span>
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* ✅ Skills Section */}
                            {app.applicantSkills?.length > 0 && (
                              <div className="border-t border-gray-200 pt-4">
                                <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                  <span className="w-1 h-4 bg-blue-500 rounded"></span>
                                  Skills
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                  {app.applicantSkills.map((skill, index) => (
                                    <span
                                      key={index}
                                      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200"
                                    >
                                      {skill}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* ✅ About Me Section */}
                            {app.aboutMe && (
                              <div className="border-t border-gray-200 pt-4">
                                <div className="flex items-center justify-between mb-3">
                                  <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                    <User className="w-4 h-4 text-indigo-600" />
                                    About {app.applicantName.split(" ")[0]}
                                  </h4>
                                  <button
                                    onClick={() => toggleAboutMe(app.id)}
                                    className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
                                  >
                                    {expandedAboutMe[app.id] ? (
                                      <>
                                        Show Less
                                        <svg
                                          className="w-3 h-3"
                                          fill="none"
                                          stroke="currentColor"
                                          viewBox="0 0 24 24"
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M5 15l7-7 7 7"
                                          />
                                        </svg>
                                      </>
                                    ) : (
                                      <>
                                        Show More
                                        <svg
                                          className="w-3 h-3"
                                          fill="none"
                                          stroke="currentColor"
                                          viewBox="0 0 24 24"
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M19 9l-7 7-7-7"
                                          />
                                        </svg>
                                      </>
                                    )}
                                  </button>
                                </div>
                                <div
                                  className={`relative bg-gradient-to-br from-indigo-50 to-blue-50 rounded-lg p-4 border border-indigo-100 transition-all duration-300 ${
                                    expandedAboutMe[app.id]
                                      ? "max-h-[500px] overflow-y-auto"
                                      : "max-h-[120px] overflow-hidden"
                                  }`}
                                >
                                  <div
                                    className="prose prose-sm max-w-none text-gray-700 prose-headings:text-indigo-900 prose-strong:text-gray-900 prose-a:text-indigo-600"
                                    dangerouslySetInnerHTML={{
                                      __html: app.aboutMe,
                                    }}
                                  />
                                  {!expandedAboutMe[app.id] && (
                                    <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-indigo-50 to-transparent pointer-events-none"></div>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* ✅ Action Buttons */}
                            {app.status === "pending" && (
                              <div className="flex gap-3 pt-4 border-t border-gray-200">
                                <button
                                  onClick={() => handleApprove(app.id)}
                                  className="flex-1 px-4 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-lg shadow-md transition-all font-medium text-sm"
                                >
                                  ✓ Approve Application
                                </button>
                                <button
                                  onClick={() => handleReject(app.id)}
                                  className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg shadow-md transition-all font-medium text-sm"
                                >
                                  ✗ Reject Application
                                </button>
                              </div>
                            )}
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

      {/* ✅ VIDEO MODAL */}
      {showVideoModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4 animate-fadeIn"
          onClick={closeVideoModal}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden animate-slideUp"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-indigo-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <Video className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Introduction Video
                  </h3>
                  <p className="text-sm text-gray-600">
                    {currentApplicantName}
                  </p>
                </div>
              </div>
              <button
                onClick={closeVideoModal}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-200 transition-colors"
                title="Close (ESC)"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 bg-gray-900">
              <video
                src={currentVideoUrl}
                controls
                autoPlay
                className="w-full rounded-lg shadow-lg"
                style={{ maxHeight: "70vh" }}
              >
                Your browser does not support the video tag.
              </video>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
              <p className="text-sm text-gray-600">
                💡 Tip: Press{" "}
                <kbd className="px-2 py-1 bg-gray-200 rounded text-xs font-mono">
                  ESC
                </kbd>{" "}
                to close
              </p>
              <button
                onClick={closeVideoModal}
                className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ RESUME MODAL */}
      {showResumeModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4 animate-fadeIn"
          onClick={closeResumeModal}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden animate-slideUp"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <FileText className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Resume / CV
                  </h3>
                  <p className="text-sm text-gray-600">
                    {currentApplicantName}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={currentResumeUrl}
                  download
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                  title="Download Resume"
                >
                  <Download className="w-4 h-4" />
                  Download
                </a>
                <button
                  onClick={closeResumeModal}
                  className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-200 transition-colors"
                  title="Close (ESC)"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 bg-gray-100 h-[calc(90vh-180px)] overflow-auto">
              <iframe
                src={currentResumeUrl}
                className="w-full h-full rounded-lg shadow-lg bg-white"
                title={`${currentApplicantName}'s Resume`}
              />
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
              <p className="text-sm text-gray-600">
                💡 Tip: Press{" "}
                <kbd className="px-2 py-1 bg-gray-200 rounded text-xs font-mono">
                  ESC
                </kbd>{" "}
                to close
              </p>
              <button
                onClick={closeResumeModal}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            transform: translateY(50px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }

        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }

        kbd {
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </>
  );
};

const jobLoader = async ({ params }) => {
  const res = await fetch(`/api/jobs/${params.id}`);
  const data = await res.json();
  return data;
};

export { JobPage as default, jobLoader };
