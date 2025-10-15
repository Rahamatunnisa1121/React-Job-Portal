import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Link } from "react-router-dom";

const Recommendations = () => {
  const { user } = useAuth();
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [allSkills, setAllSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState({});
  const [appliedJobs, setAppliedJobs] = useState(new Set());

  useEffect(() => {
    const fetchData = async () => {
      if (!user || user.role !== "developer") {
        setLoading(false);
        return;
      }

      try {
        // Fetch all skills for skill name mapping
        const skillsResponse = await fetch("/api/skills");
        const skillsData = await skillsResponse.json();
        setAllSkills(skillsData);

        // Fetch user's applications to exclude already applied jobs
        const applicationsResponse = await fetch(
          `/api/applications?applicantId=${user.id}`
        );
        const applicationsData = await applicationsResponse.json();
        const appliedJobIds = new Set(applicationsData.map((app) => app.jobId));
        setAppliedJobs(appliedJobIds);

        // Fetch all jobs
        const jobsResponse = await fetch("/api/jobs");
        const jobsData = await jobsResponse.json();

        // Get user skills
        const userSkillIds = user.skills || [];

        // Filter and score jobs based on skill matching
        const scoredJobs = jobsData
          .filter((job) => !appliedJobIds.has(job.id)) // Exclude already applied jobs
          .map((job) => {
            const score = calculateJobScore(job, userSkillIds, skillsData);
            return { ...job, matchScore: score };
          })
          .filter((job) => job.matchScore >= 1) // Only jobs with at least 1 matching skill
          .sort((a, b) => b.matchScore - a.matchScore); // Sort by best match first

        setRecommendedJobs(scoredJobs);
      } catch (error) {
        console.error("Error fetching recommendations:", error);
      }
      setLoading(false);
    };

    fetchData();
  }, [user]);

  // Calculate job matching score based on skills
  const calculateJobScore = (job, userSkillIds, skills) => {
    let score = 0;

    // Combine job title and description for keyword matching
    const jobText = `${job.title} ${job.description}`.toLowerCase();

    // Also check job.skills array if it exists
    const jobSkillIds = job.skills || [];

    userSkillIds.forEach((skillId) => {
      const skill = skills.find((s) => String(s.id) === String(skillId));
      if (skill) {
        const skillName = skill.name.toLowerCase();

        // Check if skill ID is in job's skills array (direct match)
        if (
          jobSkillIds.some(
            (jobSkillId) => String(jobSkillId) === String(skillId)
          )
        ) {
          score += 2; // Higher score for direct skill match
        }
        // Check if the skill name appears in the job text (keyword match)
        else if (jobText.includes(skillName)) {
          score += 1;
        }
      }
    });

    return score;
  };

  // Get skill name by ID
  const getSkillName = (skillId) => {
    const skill = allSkills.find((s) => String(s.id) === String(skillId));
    return skill ? skill.name : `Skill ${skillId}`;
  };

  // Get matching skills for a job
  const getMatchingSkills = (job) => {
    const userSkillIds = user.skills || [];
    const jobText = `${job.title} ${job.description}`.toLowerCase();
    const jobSkillIds = job.skills || [];

    return userSkillIds
      .map((skillId) => {
        const skill = allSkills.find((s) => String(s.id) === String(skillId));
        if (skill) {
          // Check direct match in job skills array
          if (
            jobSkillIds.some(
              (jobSkillId) => String(jobSkillId) === String(skillId)
            )
          ) {
            return skill;
          }
          // Check keyword match in job text
          if (jobText.includes(skill.name.toLowerCase())) {
            return skill;
          }
        }
        return null;
      })
      .filter(Boolean);
  };

  // Calculate match percentage
  const getMatchPercentage = (matchScore) => {
    const maxPossibleScore = user.skills?.length || 1;
    return Math.round((matchScore / maxPossibleScore) * 100);
  };

  // Apply to job function
  const handleApplyToJob = async (jobId, employerId) => {
    setApplying((prev) => ({ ...prev, [jobId]: true }));

    try {
      const applicationData = {
        id: Date.now().toString(36) + Math.random().toString(36).substr(2),
        jobId: jobId,
        employerId: employerId,
        applicantId: user.id,
        applicantName: user.name || "Developer",
        applicantEmail: user.email || "",
        appliedAt: new Date().toISOString(),
        status: "pending",
      };

      const response = await fetch("/api/applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(applicationData),
      });

      if (response.ok) {
        alert("Application submitted successfully!");
        setAppliedJobs((prev) => new Set([...prev, jobId]));
        setRecommendedJobs((prev) => prev.filter((job) => job.id !== jobId));
      } else {
        throw new Error("Failed to submit application");
      }
    } catch (error) {
      console.error("Error applying to job:", error);
      alert("Failed to submit application. Please try again.");
    }

    setApplying((prev) => ({ ...prev, [jobId]: false }));
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "Recently";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        <div className="ml-4 text-lg text-gray-600">
          Finding jobs that match your skills...
        </div>
      </div>
    );
  }

  if (user?.role !== "developer") {
    return (
      <div className="text-center text-gray-500 py-12">
        <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
        <p>Job recommendations are only available for developers.</p>
      </div>
    );
  }

  if (!user.skills || user.skills.length === 0) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            🎯 Job Recommendations
          </h1>
          <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
            <div className="text-6xl mb-4">🛠</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Add Skills to Get Recommendations
            </h3>
            <p className="text-gray-500 mb-6">
              Update your profile with your skills to see personalized job
              recommendations.
            </p>
            <Link
              to="/profile"
              className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Update Profile
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🎯 Job Recommendations
          </h1>
          <p className="text-gray-600">
            Jobs that match your skills • {recommendedJobs.length}{" "}
            recommendation(s) found
          </p>
        </div>

        {/* User Skills Summary */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            🛠 Your Skills
          </h2>
          <div className="flex flex-wrap gap-2">
            {user.skills?.map((skillId) => (
              <span
                key={skillId}
                className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium"
              >
                {getSkillName(skillId)}
              </span>
            ))}
          </div>
        </div>

        {/* Recommendations */}
        {recommendedJobs.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No Matching Jobs Found
            </h3>
            <p className="text-gray-500 mb-6">
              There are currently no jobs that match your skills. Check back
              later or browse all available jobs.
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                to="/jobs"
                className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Browse All Jobs
              </Link>
              <Link
                to="/profile"
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Update Skills
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            {recommendedJobs.map((job) => {
              const matchingSkills = getMatchingSkills(job);
              const matchPercentage = getMatchPercentage(job.matchScore);

              return (
                <div
                  key={job.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                >
                  {/* Match Score Header */}
                  <div
                    className={`border-b p-4 rounded-t-lg ${
                      matchPercentage >= 70
                        ? "bg-green-50 border-green-200"
                        : matchPercentage >= 40
                        ? "bg-blue-50 border-blue-200"
                        : "bg-yellow-50 border-yellow-200"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-bold text-white ${
                            matchPercentage >= 70
                              ? "bg-green-500"
                              : matchPercentage >= 40
                              ? "bg-blue-500"
                              : "bg-yellow-500"
                          }`}
                        >
                          {matchPercentage}% Match
                        </span>
                        <span
                          className={`text-sm font-medium ${
                            matchPercentage >= 70
                              ? "text-green-700"
                              : matchPercentage >= 40
                              ? "text-blue-700"
                              : "text-yellow-700"
                          }`}
                        >
                          {job.matchScore} skill
                          {job.matchScore !== 1 ? "s" : ""} match
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Job Details */}
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          <Link
                            to={`/jobs/${job.id}`}
                            className="hover:text-indigo-600 transition-colors"
                          >
                            {job.title}
                          </Link>
                        </h3>
                        <div className="space-y-1 text-sm text-gray-600 mb-3">
                          {job.company?.name && <p>🏢 {job.company.name}</p>}
                          <p>📍 {job.location}</p>
                          <p>💼 {job.type}</p>
                          {job.salary && <p>💰 {job.salary}</p>}
                        </div>
                      </div>
                    </div>

                    {/* Matching Skills */}
                    {matchingSkills.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">
                          ✅ Your Matching Skills:
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {matchingSkills.map((skill) => (
                            <span
                              key={skill.id}
                              className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200"
                            >
                              {skill.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Job Description Preview */}
                    <div className="mb-4">
                      <p className="text-sm text-gray-700 line-clamp-3">
                        {job.description}
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleApplyToJob(job.id, job.employerId)}
                        disabled={applying[job.id]}
                        className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                      >
                        {applying[job.id] ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Applying...
                          </>
                        ) : (
                          "⚡ Quick Apply"
                        )}
                      </button>
                      <Link
                        to={`/jobs/${job.id}`}
                        className="flex-1 border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold py-2 px-4 rounded-lg transition-colors text-center"
                      >
                        👁 View Details
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}


        {/* Call to Action */}
        {recommendedJobs.length > 0 && (
          <div className="mt-8 bg-indigo-50 rounded-lg border border-indigo-200 p-8 text-center">
            <h3 className="text-lg font-semibold text-indigo-900 mb-2">
              Want More Recommendations?
            </h3>
            <p className="text-indigo-700 mb-4">
              Add more skills to your profile to discover additional job
              opportunities.
            </p>
            <Link
              to="/profile"
              className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
            >
              Update Profile
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Recommendations;
