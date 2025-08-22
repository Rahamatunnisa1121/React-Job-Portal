import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import JobListing from "./JobListing";
import Spinner from "./Spinner";

// 🔹 Helper: check if job.salary matches selected salary filter
const matchSalaryFilter = (filterSalary, jobSalary) => {
  if (!filterSalary || !jobSalary) return true;

  let min = 0,
    max = Infinity;

  // Parse filter range
  if (filterSalary.toLowerCase().includes("under")) {
    max = parseInt(filterSalary.replace(/\D/g, ""), 10) * 1000;
  } else if (filterSalary.toLowerCase().includes("over")) {
    min = parseInt(filterSalary.replace(/\D/g, ""), 10) * 1000;
  } else if (filterSalary.includes("-")) {
    [min, max] = filterSalary
      .split("-")
      .map((s) => parseInt(s.replace(/\D/g, ""), 10) * 1000);
  }

  // Parse job salary
  let jobMin = 0,
    jobMax = 0;
  if (jobSalary.toLowerCase().includes("under")) {
    jobMin = 0;
    jobMax = parseInt(jobSalary.replace(/\D/g, ""), 10) * 1000;
  } else if (jobSalary.toLowerCase().includes("over")) {
    jobMin = parseInt(jobSalary.replace(/\D/g, ""), 10) * 1000;
    jobMax = Infinity;
  } else if (jobSalary.includes("-")) {
    [jobMin, jobMax] = jobSalary
      .split("-")
      .map((s) => parseInt(s.replace(/\D/g, ""), 10) * 1000);
  }

  // ✅ Return true if ranges overlap
  return jobMin <= max && jobMax >= min;
};

const JobListings = ({ isHome = false }) => {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const { user, isDeveloper, isEmployer } = useAuth();

  useEffect(() => {
    const fetchJobs = async () => {
      const apiUrl = isHome ? "/api/jobs?_limit=3" : "/api/jobs";
      try {
        const res = await fetch(apiUrl);
        const data = await res.json();

        let roleFilteredJobs;
        if (isEmployer()) {
          // roleFilteredJobs = data.filter((job) => job.employerId === user.id);
          roleFilteredJobs = data.filter(
            (job) => String(job.employerId) === String(user.id)
          );
        } else {
          roleFilteredJobs = data;
        }
        

        setJobs(roleFilteredJobs);
        setFilteredJobs(roleFilteredJobs);
      } catch (error) {
        console.log("Error fetching data", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchJobs();
    }
  }, [user, isHome, isDeveloper, isEmployer]);

  // Apply filters from query string
  useEffect(() => {
    if (!isHome && jobs.length > 0) {
      const searchParams = new URLSearchParams(location.search);
      const keyword = searchParams.get("keyword") || "";
      const salary = searchParams.get("salary") || "";
      const locationFilter = searchParams.get("location") || "";

      let filtered = jobs;

      // Keyword filter
      if (keyword) {
        filtered = filtered.filter(
          (job) =>
            job.title.toLowerCase().includes(keyword.toLowerCase()) ||
            job.company.name.toLowerCase().includes(keyword.toLowerCase()) ||
            job.description.toLowerCase().includes(keyword.toLowerCase()) ||
            job.type.toLowerCase().includes(keyword.toLowerCase())
        );
      }

      // Salary filter (🔹 updated here)
      if (salary) {
        filtered = filtered.filter((job) =>
          matchSalaryFilter(salary, job.salary)
        );
      }

      // Location filter
      if (locationFilter) {
        filtered = filtered.filter((job) =>
          job.location.toLowerCase().includes(locationFilter.toLowerCase())
        );
      }

      setFilteredJobs(filtered);
    }
  }, [location.search, jobs, isHome]);

  const getFilterInfo = () => {
    const searchParams = new URLSearchParams(location.search);
    return {
      keyword: searchParams.get("keyword") || "",
      salary: searchParams.get("salary") || "",
      location: searchParams.get("location") || "",
    };
  };

  const filters = getFilterInfo();
  const hasFilters = filters.keyword || filters.salary || filters.location;

  const getTitle = () => {
    if (isHome) {
      return "Recent Jobs";
    } else {
      return isDeveloper() ? "Browse Jobs" : "Your Job Posts";
    }
  };

  const getEmptyMessage = () => {
    if (isEmployer() && !hasFilters) {
      return {
        title: "No Job Posts Yet",
        message:
          "You haven't posted any jobs yet. Start by posting your first job to attract talented developers.",
        showAddButton: true,
      };
    } else if (hasFilters) {
      return {
        title: "No Jobs Found",
        message:
          "No jobs match your current filter criteria. Try adjusting your search.",
        showAddButton: false,
      };
    } else {
      return {
        title: "No Jobs Available",
        message:
          "No jobs are currently available. Check back later for new opportunities.",
        showAddButton: false,
      };
    }
  };

  const emptyState = getEmptyMessage();

  return (
    <section className="bg-blue-50 px-4 py-10">
      <div className="container-xl lg:container m-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-indigo-500 text-center flex-1">
            {getTitle()}
          </h2>

          {!isHome && isEmployer() && (
            <a
              href="/add-job"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded transition-colors duration-200"
            >
              + Add Job
            </a>
          )}
        </div>

        {loading ? (
          <Spinner loading={loading} />
        ) : (
          <>
            {!isHome && hasFilters && (
              <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6 max-w-4xl mx-auto">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="text-sm font-medium text-gray-600">
                    Active Filters:
                  </span>

                  {filters.keyword && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                      Keyword: {filters.keyword}
                    </span>
                  )}

                  {filters.salary && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Salary: {filters.salary}
                    </span>
                  )}

                  {filters.location && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                      Location: {filters.location}
                    </span>
                  )}
                </div>

                <p className="text-sm text-gray-600">
                  Found {filteredJobs.length} job
                  {filteredJobs.length !== 1 ? "s" : ""}
                  {hasFilters && " matching your criteria"}
                </p>
              </div>
            )}

            {!isHome && (
              <div className="bg-white rounded-lg border-l-4 border-indigo-500 p-4 mb-6 max-w-4xl mx-auto">
                <div className="flex items-center">
                  <div className="ml-3">
                    <p className="text-sm text-gray-600">
                      {isDeveloper() && (
                        <>
                          <span className="font-medium text-indigo-600">
                            Developer View:
                          </span>{" "}
                          Browse and apply to available job opportunities.
                        </>
                      )}
                      {isEmployer() && (
                        <>
                          <span className="font-medium text-indigo-600">
                            Employer View:
                          </span>{" "}
                          Manage your job posts. You can edit, delete, and view
                          applications for your jobs.
                        </>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {filteredJobs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {filteredJobs.map((job) => (
                  <JobListing key={job.id} job={job} />
                ))}
              </div>
            ) : (
              !isHome && (
                <div className="text-center py-12">
                  <div className="max-w-md mx-auto">
                    <div className="text-6xl text-gray-300 mb-4">
                      {emptyState.showAddButton ? "📝" : "🔍"}
                    </div>
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">
                      {emptyState.title}
                    </h3>
                    <p className="text-gray-500 mb-6">{emptyState.message}</p>

                    {emptyState.showAddButton ? (
                      <a
                        href="/add-job"
                        className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 transition-colors"
                      >
                        Post Your First Job
                      </a>
                    ) : hasFilters ? (
                      <a
                        href="/jobs"
                        className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                      >
                        View All Jobs
                      </a>
                    ) : null}
                  </div>
                </div>
              )
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default JobListings;
