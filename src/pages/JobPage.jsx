import { useParams, useLoaderData, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaMapMarker } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import { validateEmail } from '../utils/validateEmail';

const JobPage = ({ deleteJob, applyToJob, saveJob }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const job = useLoaderData();
  const { user, hasAnyRole } = useAuth();
  const [coverLetter, setCoverLetter] = useState('');
  const [applied, setApplied] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // Check if already saved for this user/job using user's savedJobs array
    const checkSaved = async () => {
      if (!user || !job) return;
      const res = await fetch(`http://localhost:8000/users/${user.id}`);
      const userData = await res.json();
      const savedJobs = userData.savedJobs || [];
      setSaved(savedJobs.includes(job.id));
    };
    checkSaved();
  }, [user, job]);

  // Check if user can manage this job
  const canManageJob = () => {
    if (!user) return false;
    
    // Admin and employers can manage jobs
    return hasAnyRole(['admin', 'employer']);
  };

  const onDeleteClick = (jobId) => {
    // Double-check permissions before allowing delete
    if (!canManageJob()) {
      toast.error('You do not have permission to delete this job');
      return;
    }

    const confirm = window.confirm(
      'Are you sure you want to delete this listing?'
    );

    if (!confirm) return;

    deleteJob(jobId);

    toast.success('Job deleted successfully');

    navigate('/jobs');
  };

  const handleApply = async (e) => {
    e.preventDefault();
    await applyToJob(job.id, {
      developerId: user.id,
      coverLetter,
      resume: '', // Add resume upload if needed
    });
    setApplied(true);
  };

  const handleSaveJob = async () => {
    if (saved) return;
    // Fetch current user data
    const userRes = await fetch(`http://localhost:8000/users/${user.id}`);
    const userData = await userRes.json();
    const savedJobs = userData.savedJobs || [];
    if (!savedJobs.includes(job.id)) {
      const updatedSavedJobs = [...savedJobs, job.id];
      await fetch(`http://localhost:8000/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ savedJobs: updatedSavedJobs })
      });
      setSaved(true);
      toast.success('Job saved!');
    }
  };

  return (
    <>
      <section>
        <div className='container m-auto py-6 px-6'>
          <Link
            to='/jobs'
            className='text-indigo-500 hover:text-indigo-600 flex items-center'
          >
            <FaArrowLeft className='mr-2' /> Back to Job Listings
          </Link>
        </div>
      </section>

      <section className='bg-indigo-50'>
        <div className='container m-auto py-10 px-6'>
          <div className='grid grid-cols-1 md:grid-cols-70/30 w-full gap-6'>
            <main>
              <div className='bg-white p-6 rounded-lg shadow-md text-center md:text-left'>
                <div className='text-gray-500 mb-4'>{job.type}</div>
                <h1 className='text-3xl font-bold mb-4'>{job.title}</h1>
                <div className='text-gray-500 mb-4 flex align-middle justify-center md:justify-start'>
                  <FaMapMarker className='text-orange-700 mr-1' />
                  <p className='text-orange-700'>{job.location}</p>
                </div>
              </div>

              <div className='bg-white p-6 rounded-lg shadow-md mt-6'>
                <h3 className='text-indigo-800 text-lg font-bold mb-6'>
                  Job Description
                </h3>

                <p className='mb-4'>{job.description}</p>

                <h3 className='text-indigo-800 text-lg font-bold mb-2'>
                  Salary
                </h3>

                <p className='mb-4'>{job.salary} / Year</p>
              </div>
            </main>

            {/* <!-- Sidebar --> */}
            <aside>
              <div className='bg-white p-6 rounded-lg shadow-md'>
                <h3 className='text-xl font-bold mb-6'>Company Info</h3>

                <h2 className='text-2xl'>{job.company.name}</h2>

                <p className='my-2'>{job.company.description}</p>

                <hr className='my-4' />

                <h3 className='text-xl'>Contact Email:</h3>

                <p className='my-2 bg-indigo-100 p-2 font-bold'>
                  {job.company.contactEmail}
                </p>

                <h3 className='text-xl'>Contact Phone:</h3>

                <p className='my-2 bg-indigo-100 p-2 font-bold'>
                  {job.company.contactPhone}
                </p>
              </div>

              {/* Only show "Manage Job" section for authorized users */}
              {canManageJob() && (
                <div className='bg-white p-6 rounded-lg shadow-md mt-6'>
                  <h3 className='text-xl font-bold mb-6'>Manage Job</h3>
                  <Link
                    to={`/edit-job/${job.id}`}
                    className='bg-indigo-500 hover:bg-indigo-600 text-white text-center font-bold py-2 px-4 rounded-full w-full focus:outline-none focus:shadow-outline mt-4 block'
                  >
                    Edit Job
                  </Link>
                  <button
                    onClick={() => onDeleteClick(job.id)}
                    className='bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-full w-full focus:outline-none focus:shadow-outline mt-4 block'
                  >
                    Delete Job
                  </button>
                </div>
              )}

              {/* Optional: Show different content for developers */}
              {user && hasAnyRole(['developer']) && (
                <div className='bg-white p-6 rounded-lg shadow-md mt-6'>
                  <h3 className='text-xl font-bold mb-6'>Apply for this Job</h3>
                  {!applied ? (
                    <form onSubmit={handleApply}>
                      <textarea
                        value={coverLetter}
                        onChange={e => setCoverLetter(e.target.value)}
                        placeholder="Write your cover letter"
                        required
                        className="w-full p-2 border rounded-md"
                      />
                      <button
                        type="submit"
                        className='bg-green-500 hover:bg-green-600 text-white text-center font-bold py-2 px-4 rounded-full w-full focus:outline-none focus:shadow-outline mt-4'
                      >
                        Apply Now
                      </button>
                    </form>
                  ) : (
                    <div className="text-green-600 font-bold">
                      You have applied to this job.
                    </div>
                  )}
                  {/* Save Job Button */}
                  <button
                    className={`mt-4 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-full w-full focus:outline-none focus:shadow-outline ${saved ? 'bg-gray-400 cursor-not-allowed' : ''}`}
                    onClick={handleSaveJob}
                    disabled={saved}
                  >
                    {saved ? 'Saved' : 'Save Job'}
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