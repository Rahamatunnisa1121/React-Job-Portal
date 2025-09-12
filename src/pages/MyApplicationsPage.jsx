import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext'; // adjust import as needed
import { applicationsAPI, jobsAPI } from '../utils/api';

const MyApplicationsPage = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplications = async () => {
      if (!user) return;
      const apps = await applicationsAPI.getByDeveloper(user.id);
      // Fetch job details for each application
      const jobs = await Promise.all(apps.map(app => jobsAPI.getById(app.jobId)));
      // Merge job info into applications
      const appsWithJobs = apps.map((app, idx) => ({
        ...app,
        job: jobs[idx]
      }));
      setApplications(appsWithJobs);
      setLoading(false);
    };
    fetchApplications();
  }, [user]);

//   Logged in user → Jane (id: 3)

// Fetch apps for developerId 3 → gives those 3 applications

// Merge with jobs → gives you the final array you pasted
  const handleWithdraw = async (appId) => {
    await applicationsAPI.delete(appId);
    setApplications(applications.filter(app => app.id !== appId));
  };

  if (loading) return <div>Loading...</div>;
  if (applications.length === 0) return <div>No applications found.</div>;

  return (
    <section className="bg-blue-50 px-4 py-6">
      <h2 className="text-2xl font-bold mb-4">My Applications</h2>
      <ul className="space-y-4">
        {applications.map(app => (
          <li key={app.id} className="bg-white p-4 rounded shadow">
            <strong>{app.job?.title || 'Job Deleted'}</strong> at {app.job?.company?.name || 'Unknown Company'} <br />
            Status: <span className="font-semibold">{app.status}</span> <br />
            Applied: {new Date(app.appliedAt).toLocaleDateString()} <br />
            {app.coverLetter && <div className="mt-2 text-sm text-gray-600">Cover Letter: {app.coverLetter}</div>}
            <button
              className="mt-2 px-3 py-1 bg-red-500 text-white rounded"
              onClick={() => handleWithdraw(app.id)}
            >
              Withdraw
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default MyApplicationsPage;