import { useParams } from "react-router-dom";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Building, Mail, Briefcase } from "lucide-react";
import defaultCompanyLogo from "../assets/images/company-logo.png";
import { NavLink } from "react-router-dom";

const EmployerProfile = () => {
  const { id } = useParams(); // employer id from URL
  const [employer, setEmployer] = useState(null);
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    const fetchEmployerAndJobs = async () => {
      try {
        // Fetch employer details
        const usersRes = await fetch("/api/users");
        const users = await usersRes.json();
        const foundEmployer = users.find(
          (u) => u.id === id && u.role === "employer"
        );
        setEmployer(foundEmployer);

        // Fetch jobs posted by this employer
        const jobsRes = await fetch("/api/jobs");
        const allJobs = await jobsRes.json();
        const employerJobs = allJobs.filter((job) => job.employerId === id);
        setJobs(employerJobs);
      } catch (err) {
        console.error("Error fetching employer data:", err);
      }
    };

    fetchEmployerAndJobs();
  }, [id]);

  if (!employer) {
    return (
      <div className="flex justify-center items-center h-64 text-gray-600">
        Loading employer details...
      </div>
    );
  }

  // ✅ Use employer.companyPhoto or fallback logo
  const logoToShow =
    employer.companyPhoto && employer.companyPhoto.trim() !== ""
      ? employer.companyPhoto
      : defaultCompanyLogo; // 👈 fixed here

  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* Header Card */}
      <div className="bg-white shadow-md rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6">
        <img
          src={logoToShow}
          alt={employer.name}
          className="w-32 h-32 rounded-xl object-cover border shadow"
        />
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Building className="w-6 h-6 text-gray-600" />
            {employer.name}
          </h1>
          <p className="text-gray-600 flex items-center gap-2 mt-2">
            <Mail className="w-5 h-5 text-gray-500" /> {employer.email}
          </p>
          <div
            className="mt-2 text-sm text-gray-500"
            dangerouslySetInnerHTML={{
              __html: employer.aboutMe || "No company description provided.",
            }}
          />
        </div>
      </div>

      {/* Jobs Section */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-gray-600" /> Jobs Posted (
          {jobs.length})
        </h2>
        {jobs.length > 0 ? (
          <ul className="space-y-4">
            {jobs.map((job) => (
              <li
                key={job.id}
                className="border border-gray-200 bg-gray-50 rounded-xl p-4 shadow-sm hover:shadow-md transition"
              >
                <h3 className="text-lg font-semibold text-gray-800">
                  <NavLink
                    to={`/jobs/${job.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    {job.title}
                  </NavLink>
                </h3>
                <p className="text-sm text-gray-600">{job.location}</p>
                <p className="text-sm text-gray-500 mt-1">{job.salary}</p>
                <p className="text-sm mt-2">
                  {job.description || "No description available."}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">
            This employer hasn’t posted any jobs yet.
          </p>
        )}
      </div>
    </div>
  );
};

export default EmployerProfile;
