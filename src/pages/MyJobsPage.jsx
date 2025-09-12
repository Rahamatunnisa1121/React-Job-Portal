import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { jobsAPI } from '../utils/api';

const MyJobsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [applications, setApplications] = useState([]);
  const [developers, setDevelopers] = useState([]);


// Filter jobs posted by this employer.

// Load all applications & users.

// Render cards with edit/delete options.

// Applications can later be matched to jobs using jobId and developerId.

  useEffect(() => {
    const fetchJobsAndApplications = async () => {
      if (!user) return;
      const allJobs = await jobsAPI.getAll();
      const myJobs = allJobs.filter(job => job.employerId === user.id);
      setJobs(myJobs);

      // Fetch applications and developers from jobs.json
      const res = await fetch('/src/jobs.json');
      const data = await res.json();
      setApplications(data.applications || []);
      setDevelopers(data.users || []);
      setLoading(false);
    };
    fetchJobsAndApplications();
  }, [user]);

  if (loading) return <div className="flex justify-center items-center h-64">Loading...</div>;
  if (jobs.length === 0) return <div className="text-center text-gray-500">No jobs posted yet.</div>;

  // Card layout with Edit/Delete buttons
  return (
    <div className="container mx-auto py-8">
      <h2 className="text-2xl font-bold mb-6">My Posted Jobs</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {jobs.map(job => (
          <div key={job.id} className="relative">
            <div className="bg-white shadow rounded-lg p-6 cursor-pointer hover:ring-2 hover:ring-blue-400"
              onClick={() => navigate(`/my-job/${job.id}`)}
            >
              <h3 className="text-lg font-semibold mb-2">{job.title}</h3>
              <p className="text-gray-600 mb-1">{job.location}</p>
              <p className="text-gray-500 mb-2">{job.description}</p>
              <div className="flex gap-2 mt-4">
                <button
                  className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                  onClick={e => {e.stopPropagation(); navigate(`/edit-job/${job.id}`);}}
                >
                  Edit
                </button>
                <button
                  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                  onClick={e => {e.stopPropagation(); setJobs(jobs.filter(j => j.id !== job.id)); /* TODO: Remove from backend */}}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyJobsPage;