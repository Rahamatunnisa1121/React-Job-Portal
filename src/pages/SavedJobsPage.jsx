import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';

const SavedJobsPage = () => {
  const { currentUser } = useContext(AuthContext);
  const [jobs, setJobs] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  useEffect(() => {
    // Debug: log savedJobs and jobsForSaved after each fetch
    console.log('savedJobs:', savedJobs);
    console.log('jobs:', jobs);
    const jobsForSaved = savedJobs.map(
      (jobId) => jobs.find((job) => job.id === jobId)
    ).filter(Boolean);
    console.log('jobsForSaved:', jobsForSaved);
  }, [savedJobs, jobs]);

  const fetchData = async () => {
    const jobsRes = await fetch('http://localhost:8000/jobs');
    const jobsData = await jobsRes.json();
    setJobs(jobsData);

    if (currentUser?.id) {
      const userRes = await fetch(`http://localhost:8000/users/${currentUser.id}`);
      const userData = await userRes.json();
      setSavedJobs(userData.savedJobs || []);
    } else {
      setSavedJobs([]);
    }
  };

  useEffect(() => {
    fetchData();
    // Optionally, poll every 2 seconds for updates
    const interval = setInterval(fetchData, 2000);
    return () => clearInterval(interval);
  }, []);


  // jobsForSaved: jobs whose id is in savedJobs array
  const jobsForSaved = savedJobs.map(
    (jobId) => jobs.find((job) => job.id === jobId)
  ).filter(Boolean);

  return (
    <div className="container mx-auto py-8">
      <h2 className="text-2xl font-bold mb-4">Saved Jobs</h2>
      <button
        className="mb-4 px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600"
        onClick={fetchData}
      >
        Refresh
      </button>
      {/* Debug info for troubleshooting */}
      <div className="mb-4 p-2 bg-gray-100 rounded text-xs">
  <div><strong>Current User ID:</strong> {currentUser?.id}</div>
  <div><strong>Current User Email:</strong> {currentUser?.email}</div>
  <div><strong>Saved Jobs Array:</strong> {JSON.stringify(savedJobs)}</div>
  <div><strong>Jobs Array Length:</strong> {jobs.length}</div>
  <div><strong>jobsForSaved:</strong> {JSON.stringify(jobsForSaved)}</div>
      </div>
      {jobsForSaved.length === 0 ? (
        <p>No saved jobs found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobsForSaved.map((job) => (
            <div key={job.id} className="border rounded-lg p-4 shadow flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-semibold mb-2">{job.title}</h3>
                <p className="mb-2">{job.description}</p>
                <p className="text-sm text-gray-600 mb-1">Location: {job.location}</p>
                <p className="text-sm text-gray-600 mb-1">Salary: {job.salary}</p>
                <p className="text-sm text-gray-600 mb-1">Company: {job.company?.name}</p>
              </div>
              <div className="mt-4">
                <a
                  href={`/job/${job.id}`}
                  className="inline-block px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 text-center"
                >
                  View
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedJobsPage;
