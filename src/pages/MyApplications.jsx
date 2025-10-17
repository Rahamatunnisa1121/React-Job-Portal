import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Link } from "react-router-dom";

const MyApplications = () => {
  const { user, isDeveloper } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        // Fetch applications
        const applicationsResponse = await fetch("/api/applications");
        if (!applicationsResponse.ok) {
          throw new Error("Failed to fetch applications");
        }
        const applicationsData = await applicationsResponse.json();

        // Fetch all jobs
        const jobsResponse = await fetch("/api/jobs");
        if (!jobsResponse.ok) {
          throw new Error("Failed to fetch jobs");
        }
        const jobsData = await jobsResponse.json();

        // Create a jobs map for easy lookup
        const jobsMap = jobsData.reduce((map, job) => {
          map[job.id] = job;
          return map;
        }, {});

        // Filter only this developer's applications and add job details
        const filtered = applicationsData
          .filter((app) => app.applicantId === user.id)
          .map((app) => ({
            ...app,
            jobDetails: jobsMap[app.jobId] || null, // Add job details
          }));

        setApplications(filtered);
      } catch (error) {
        console.error("Error fetching applications:", error);
      } finally {
        setLoading(false);
      }
    };

    if (isDeveloper()) {
      fetchApplications();
    }
  }, [user, isDeveloper]);

  const filteredApplications = applications.filter(
    (app) => filterStatus === "all" || app.status === filterStatus
  );

  const getStatusStats = () => {
    const stats = applications.reduce((acc, app) => {
      acc[app.status] = (acc[app.status] || 0) + 1;
      return acc;
    }, {});
    return stats;
  };

  const stats = getStatusStats();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Loading Applications
          </h2>
          <p className="text-gray-600">
            Please wait while we fetch your data...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="container mx-auto py-12 px-6 max-w-6xl">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                My Applications
              </h1>
              <p className="text-gray-600 mt-1">
                Track and manage your job applications
              </p>
            </div>
          </div>

          {/* Filter Buttons */}
          {applications.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {["all", "pending", "approved", "rejected"].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    filterStatus === status
                      ? "bg-indigo-600 text-white shadow-lg"
                      : "bg-white text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 border border-gray-200"
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                  {status !== "all" && stats[status] && (
                    <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-white/20">
                      {stats[status]}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Applications List */}
        {filteredApplications.length > 0 ? (
          <div className="space-y-6">
            {filteredApplications.map((app, index) => (
              <div
                key={app.id}
                className="group bg-white rounded-xl shadow-md hover:shadow-xl border border-gray-100 overflow-hidden transition-all duration-300 hover:-translate-y-1"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
                        {app.jobDetails ? (
                          <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                            />
                          </svg>
                        ) : (
                          "?"
                        )}
                      </div>
                      <div>
                        {/* ✅ Display Job Title instead of Job ID */}
                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                          {app.jobDetails
                            ? app.jobDetails.title
                            : `Job #${app.jobId}`}
                        </h3>

                        {/* ✅ Display Job Location and Type */}
                        {app.jobDetails && (
                          <div className="flex items-center gap-3 text-sm text-gray-600 mt-1">
                            <span className="flex items-center gap-1">
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                />
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                              </svg>
                              {app.jobDetails.location}
                            </span>
                            <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                            <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">
                              {app.jobDetails.type}
                            </span>
                          </div>
                        )}

                        {/* Applied Date */}
                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-2">
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          Applied{" "}
                          {new Date(app.appliedAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div
                      className={`px-4 py-2 rounded-full text-sm font-semibold border ${
                        app.status === "approved"
                          ? "bg-green-50 text-green-700 border-green-200"
                          : app.status === "rejected"
                          ? "bg-red-50 text-red-700 border-red-200"
                          : "bg-yellow-50 text-yellow-700 border-yellow-200"
                      }`}
                    >
                      {app.status === "approved" && "✓ Approved"}
                      {app.status === "rejected" && "✗ Rejected"}
                      {app.status === "pending" && "⏳ Under Review"}
                      {!["approved", "rejected", "pending"].includes(
                        app.status
                      ) && app.status}
                    </div>
                  </div>

                  {/* ✅ Display Company Name and Salary */}
                  {app.jobDetails && (
                    <div className="flex items-center gap-4 py-3 px-4 bg-gray-50 rounded-lg mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <svg
                          className="w-4 h-4 text-gray-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                          />
                        </svg>
                        <span className="font-medium">
                          {app.jobDetails.company.name}
                        </span>
                      </div>
                      <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <svg
                          className="w-4 h-4 text-green-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <span className="font-medium text-green-700">
                          {app.jobDetails.salary}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-4">
                      {app.jobDetails ? (
                        <Link
                          to={`/jobs/${app.jobId}`}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200 focus:ring-4 focus:ring-indigo-200"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                          View Job Details
                        </Link>
                      ) : (
                        <div className="px-4 py-2 bg-gray-100 text-gray-500 rounded-lg text-sm">
                          Job not found
                        </div>
                      )}
                    </div>

                    <div className="text-xs text-gray-400">
                      Application ID: {app.id}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : applications.length > 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-md">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No {filterStatus} applications
            </h3>
            <p className="text-gray-500">
              Try adjusting your filter to see more results.
            </p>
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-xl shadow-md">
            <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-10 h-10 text-indigo-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              No Applications Yet
            </h3>
            <p className="text-gray-600 mb-6">
              You haven't applied to any jobs yet. Start exploring
              opportunities!
            </p>
            <Link
              to="/jobs"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              Browse Jobs
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyApplications;
