import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const MyJobApplicantsPage = () => {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [developers, setDevelopers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch('/src/jobs.json');
      const data = await res.json();
      const foundJob = data.jobs.find(j => j.id === id);
      setJob(foundJob);
      const jobApplications = (data.applications || []).filter(app => app.jobId === id);
      setApplicants(jobApplications);
      setDevelopers(data.users || []);
      setLoading(false);
    };
    fetchData();
  }, [id]);

  if (loading) return <div className="flex justify-center items-center h-64">Loading...</div>;
  if (!job) return <div className="text-center text-gray-500">Job not found.</div>;

  return (
    <div className="container mx-auto py-8">
      <h2 className="text-2xl font-bold mb-6">Applicants for: {job.title}</h2>
      {applicants.length === 0 ? (
        <div className="text-center text-gray-400">No applications yet.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {applicants.map(app => {
            const dev = developers.find(d => d.id === app.developerId);
            return (
              <div key={app.id} className="bg-white shadow rounded-lg p-6">
                <div className="font-semibold mb-2">
                  {dev ? `${dev.firstName} ${dev.lastName}` : `Developer ID: ${app.developerId}`}
                  {dev && <span className="text-blue-600 ml-2">{dev.email}</span>}
                </div>
                {app.coverLetter && (
                  <div className="mt-1 text-gray-700"><span className="font-medium">Cover Letter:</span> {app.coverLetter}</div>
                )}
                {dev && dev.skills && dev.skills.length > 0 && (
                  <div className="mt-1 text-gray-700">
                    <span className="font-medium">Skills:</span> {dev.skills.map(s => s.name).join(', ')}
                  </div>
                )}
                {app.resume && (
                  <div className="mt-1 text-gray-700"><span className="font-medium">Resume:</span> {app.resume}</div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyJobApplicantsPage;
