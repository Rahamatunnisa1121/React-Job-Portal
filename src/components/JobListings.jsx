// import { useState, useEffect } from 'react';
// import JobListing from './JobListing';
// import Spinner from './Spinner';
// import SearchBar from './SearchBar';

// const JobListings = ({ isHome = false }) => {
//   const [jobs, setJobs] = useState([]);
//   const [filteredJobs, setFilteredJobs] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [searchTerm, setSearchTerm] = useState('');

//   useEffect(() => {
//     const fetchJobs = async () => {
//       const apiUrl = isHome ? '/api/jobs?_limit=3' : '/api/jobs';
//       try {
//         const res = await fetch(apiUrl);
//         const data = await res.json();
//         setJobs(data);
//         setFilteredJobs(data); // Initialize filtered jobs with all jobs
//       } catch (error) {
//         console.log('Error fetching data', error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchJobs();
//   }, []);

//   // Search functionality
//   const handleSearch = (term) => {
//     if (!term.trim()) {
//       setFilteredJobs(jobs); // Show all jobs if search is empty
//     } else {
//       const filtered = jobs.filter((job) =>
//         job.title.toLowerCase().includes(term.toLowerCase()) ||
//         job.company.name.toLowerCase().includes(term.toLowerCase()) ||
//         job.location.toLowerCase().includes(term.toLowerCase()) ||
//         job.type.toLowerCase().includes(term.toLowerCase()) ||
//         job.description.toLowerCase().includes(term.toLowerCase())
//       );
//       setFilteredJobs(filtered);
//     }
//   };

//   // Update filtered jobs when search term changes
//   useEffect(() => {
//     handleSearch(searchTerm);
//   }, [searchTerm, jobs]);

//   return (
//     <section className='bg-blue-50 px-4 py-10'>
//       <div className='container-xl lg:container m-auto'>
//         <h2 className='text-3xl font-bold text-indigo-500 mb-6 text-center'>
//           {isHome ? 'Recent Jobs' : 'Browse Jobs'}
//         </h2>

//         {/* Show search bar only on jobs page, not home page */}
//         {!isHome && (
//           <SearchBar 
//             onSearch={handleSearch}
//             searchTerm={searchTerm}
//             setSearchTerm={setSearchTerm}
//           />
//         )}

//         {loading ? (
//           <Spinner loading={loading} />
//         ) : (
//           <>
//             {/* Show search results count */}
//             {!isHome && searchTerm && (
//               <div className="text-center mb-4">
//                 <p className="text-gray-600">
//                   Found {filteredJobs.length} job{filteredJobs.length !== 1 ? 's' : ''} 
//                   {searchTerm && ` matching "${searchTerm}"`}
//                 </p>
//               </div>
//             )}

//             {/* Show jobs or no results message */}
//             {filteredJobs.length > 0 ? (
//               <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
//                 {filteredJobs.map((job) => (
//                   <JobListing key={job.id} job={job} />
//                 ))}
//               </div>
//             ) : (
//               !isHome && searchTerm && (
//                 <div className="text-center py-8">
//                   <p className="text-gray-500 text-lg">
//                     No jobs found matching "{searchTerm}"
//                   </p>
//                   <p className="text-gray-400 text-sm mt-2">
//                     Try searching with different keywords
//                   </p>
//                 </div>
//               )
//             )}
//           </>
//         )}
//       </div>
//     </section>
//   );
// };

// export default JobListings;
// import { useState, useEffect } from 'react';
// import { useLocation } from 'react-router-dom';
// import JobListing from './JobListing';
// import Spinner from './Spinner';

// const JobListings = ({ isHome = false }) => {
//   const [jobs, setJobs] = useState([]);
//   const [filteredJobs, setFilteredJobs] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const location = useLocation();

//   useEffect(() => {
//     const fetchJobs = async () => {
//       const apiUrl = isHome ? '/api/jobs?_limit=3' : '/api/jobs';
//       try {
//         const res = await fetch(apiUrl);
//         const data = await res.json();
//         setJobs(data);
//         setFilteredJobs(data);
//       } catch (error) {
//         console.log('Error fetching data', error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchJobs();
//   }, []);

//   // Filter jobs based on URL parameters (from homepage filters)
//   useEffect(() => {
//     if (!isHome && jobs.length > 0) {
//       // URLSearchParams is a built-in browser API that lets us read query strings like "?keyword=developer"
//       const searchParams = new URLSearchParams(location.search);
//       const keyword = searchParams.get('keyword') || '';
//       const salary = searchParams.get('salary') || '';
//       const locationFilter = searchParams.get('location') || '';

//       let filtered = jobs;

//       // Apply keyword filter
//          // Keep only jobs where keyword matches in title, company name, description, or type
//       if (keyword) {
//          // Array.filter() is a built-in method that loops through an array and
//     // returns only the elements that pass a test (true condition).
//     // String.toLowerCase() makes text lowercase so search is case-insensitive.
//     // String.includes() checks if one string is found inside another (returns true/false).
//         filtered = filtered.filter((job) =>
//           job.title.toLowerCase().includes(keyword.toLowerCase()) ||
//           job.company.name.toLowerCase().includes(keyword.toLowerCase()) ||
//           job.description.toLowerCase().includes(keyword.toLowerCase()) ||
//           job.type.toLowerCase().includes(keyword.toLowerCase())
//         );
//       }

//       // Apply salary filter
//       // Keep only jobs where the salary exactly matches the filter
//       if (salary) {
//         filtered = filtered.filter((job) => job.salary === salary);
//       }

//       // Apply location filter
//       if (locationFilter) {
//         filtered = filtered.filter((job) =>
//           job.location.toLowerCase().includes(locationFilter.toLowerCase())
//         );
//       }

//       setFilteredJobs(filtered);
//     }
//   }, [location.search, jobs, isHome]);

//   // Get current filter values for display
//   const getFilterInfo = () => {
//     const searchParams = new URLSearchParams(location.search);
//     return {
//       keyword: searchParams.get('keyword') || '',
//       salary: searchParams.get('salary') || '',
//       location: searchParams.get('location') || ''
//     };
//   };

//   const filters = getFilterInfo();
//   const hasFilters = filters.keyword || filters.salary || filters.location;

//   return (
//     <section className='bg-blue-50 px-4 py-10'>
//       <div className='container-xl lg:container m-auto'>
//         <h2 className='text-3xl font-bold text-indigo-500 mb-6 text-center'>
//           {isHome ? 'Recent Jobs' : 'Browse Jobs'}
//         </h2>

//         {loading ? (
//           <Spinner loading={loading} />
//         ) : (
//           <>
//             {/* Show active filters info */}
//             {!isHome && hasFilters && (
//               <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6 max-w-4xl mx-auto">
//                 <div className="flex flex-wrap items-center gap-2 mb-2">
//                   <span className="text-sm font-medium text-gray-600">Active Filters:</span>
                  
//                   {filters.keyword && (
//                     <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
//                       Keyword: {filters.keyword}
//                     </span>
//                   )}
                  
//                   {filters.salary && (
//                     <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
//                       Salary: {filters.salary}
//                     </span>
//                   )}
                  
//                   {filters.location && (
//                     <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
//                       Location: {filters.location}
//                     </span>
//                   )}
//                 </div>
                
//                 <p className="text-sm text-gray-600">
//                   Found {filteredJobs.length} job{filteredJobs.length !== 1 ? 's' : ''}
//                   {hasFilters && ' matching your criteria'}
//                 </p>
//               </div>
//             )}

//             {/* Show jobs or no results message */}
//             {filteredJobs.length > 0 ? (
//               <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
//                 {filteredJobs.map((job) => (
//                   <JobListing key={job.id} job={job} />
//                 ))}
//               </div>
//             ) : (
//               !isHome && (
//                 <div className="text-center py-12">
//                   <div className="max-w-md mx-auto">
//                     <div className="text-6xl text-gray-300 mb-4">🔍</div>
//                     <h3 className="text-xl font-semibold text-gray-700 mb-2">
//                       No Jobs Found
//                     </h3>
//                     <p className="text-gray-500 mb-6">
//                       {hasFilters 
//                         ? "No jobs match your current filter criteria. Try adjusting your search."
//                         : "No jobs are currently available."
//                       }
//                     </p>
//                     {hasFilters && (
//                       <a
//                         href="/jobs"
//                         className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
//                       >
//                         View All Jobs
//                       </a>
//                     )}
//                   </div>
//                 </div>
//               )
//             )}
//           </>
//         )}
//       </div>
//     </section>
//   );
// };

// export default JobListings;
// import { useState, useEffect } from 'react';
// import { useLocation } from 'react-router-dom';
// import JobListing from './JobListing';
// import Spinner from './Spinner';

// const JobListings = ({ isHome = false }) => {
//   const [jobs, setJobs] = useState([]);
//   const [filteredJobs, setFilteredJobs] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const location = useLocation();

//   useEffect(() => {
//     const fetchJobs = async () => {
//       const apiUrl = isHome ? '/api/jobs?_limit=3' : '/api/jobs';
//       try {
//         const res = await fetch(apiUrl);
//         const data = await res.json();
//         setJobs(data);
//         setFilteredJobs(data);
//       } catch (error) {
//         console.log('Error fetching data', error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchJobs();
//   }, []);
// const parseSalaryRange = (range) => {
//   if (range === "Under $50K") return [0, 49999]; // strictly under 50k
//   if (range === "Over $200K") return [200001, Infinity]; // strictly above 200k

//   const match = range.match(/\$(\d+)K\s*[-–]\s*\$(\d+)K/);

//   if (match) {
//     const min = parseInt(match[1]) * 1000;
//     const max = parseInt(match[2]) * 1000;
//     return [min, max];
//   }

//   return [0, Infinity];
// };


//   const salaryMatches = (jobSalary, filterSalary) => {
//   if (!filterSalary) return true;

//   const [filterMin, filterMax] = parseSalaryRange(filterSalary);
//   const [jobMin, jobMax] = parseSalaryRange(jobSalary);

//   // Inclusive overlap check
//   return jobMin <= filterMax && jobMax >= filterMin;
// };


//   // Filter jobs based on URL parameters (from homepage filters)
//   useEffect(() => {
//     if (!isHome && jobs.length > 0) {
//       const searchParams = new URLSearchParams(location.search);
//       const keyword = searchParams.get('keyword') || '';
//       const salary = searchParams.get('salary') || '';
//       const locationFilter = searchParams.get('location') || '';

//       let filtered = jobs;

//       // Apply keyword filter
//       if (keyword) {
//         filtered = filtered.filter((job) =>
//           job.title.toLowerCase().includes(keyword.toLowerCase()) ||
//           job.company.name.toLowerCase().includes(keyword.toLowerCase()) ||
//           job.description.toLowerCase().includes(keyword.toLowerCase()) ||
//           job.type.toLowerCase().includes(keyword.toLowerCase())
//         );
//       }

//       // Apply salary filter with improved overlap logic
//       if (salary) {
//         filtered = filtered.filter((job) => salaryMatches(job.salary, salary));
//       }

//       // Apply location filter
//       if (locationFilter) {
//         filtered = filtered.filter((job) =>
//           job.location.toLowerCase().includes(locationFilter.toLowerCase())
//         );
//       }

//       setFilteredJobs(filtered);
//     }
//   }, [location.search, jobs, isHome]);

//   // Get current filter values for display
//   const getFilterInfo = () => {
//     const searchParams = new URLSearchParams(location.search);
//     return {
//       keyword: searchParams.get('keyword') || '',
//       salary: searchParams.get('salary') || '',
//       location: searchParams.get('location') || ''
//     };
//   };

//   const filters = getFilterInfo();
//   const hasFilters = filters.keyword || filters.salary || filters.location;

//   return (
//     <section className='bg-blue-50 px-4 py-10'>
//       <div className='container-xl lg:container m-auto'>
//         <h2 className='text-3xl font-bold text-indigo-500 mb-6 text-center'>
//           {isHome ? 'Recent Jobs' : 'Browse Jobs'}
//         </h2>

//         {loading ? (
//           <Spinner loading={loading} />
//         ) : (
//           <>
//             {/* Show active filters info */}
//             {!isHome && hasFilters && (
//               <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6 max-w-4xl mx-auto">
//                 <div className="flex flex-wrap items-center gap-2 mb-2">
//                   <span className="text-sm font-medium text-gray-600">Active Filters:</span>
                  
//                   {filters.keyword && (
//                     <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
//                       Keyword: {filters.keyword}
//                     </span>
//                   )}
                  
//                   {filters.salary && (
//                     <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
//                       Salary: {filters.salary}
//                     </span>
//                   )}
                  
//                   {filters.location && (
//                     <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
//                       Location: {filters.location}
//                     </span>
//                   )}
//                 </div>
                
//                 <p className="text-sm text-gray-600">
//                   Found {filteredJobs.length} job{filteredJobs.length !== 1 ? 's' : ''}
//                   {hasFilters && ' matching your criteria'}
//                 </p>
//               </div>
//             )}

//             {/* Show jobs or no results message */}
//             {filteredJobs.length > 0 ? (
//               <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
//                 {filteredJobs.map((job) => (
//                   <JobListing key={job.id} job={job} />
//                 ))}
//               </div>
//             ) : (
//               !isHome && (
//                 <div className="text-center py-12">
//                   <div className="max-w-md mx-auto">
//                     <div className="text-6xl text-gray-300 mb-4">🔍</div>
//                     <h3 className="text-xl font-semibold text-gray-700 mb-2">
//                       No Jobs Found
//                     </h3>
//                     <p className="text-gray-500 mb-6">
//                       {hasFilters 
//                         ? "No jobs match your current filter criteria. Try adjusting your search."
//                         : "No jobs are currently available."
//                       }
//                     </p>
//                     {hasFilters && (
//                       <a
//                         href="/jobs"
//                         className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
//                       >
//                         View All Jobs
//                       </a>
//                     )}
//                   </div>
//                 </div>
//               )
//             )}
//           </>
//         )}
//       </div>
//     </section>
//   );
// };

// export default JobListings;
import { useContext, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import JobListing from './JobListing';
import Spinner from './Spinner';

const JobListings = ({ isHome = false }) => {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const { user } = useContext(AuthContext);
  const [savedJobs, setSavedJobs] = useState([]);

  const saveJob = (jobId, developerId) => {
    if (!savedJobs.some(sj => sj.jobId === jobId && sj.developerId === developerId)) {
      setSavedJobs([...savedJobs, {
        id: Date.now().toString(),
        jobId,
        developerId,
        savedAt: new Date().toISOString()
      }]);
    }
  };

  const parseSalaryRange = (salaryStr) => {
    if (!salaryStr) return [null, null];
    if (salaryStr.startsWith('Under')) {
      const max = parseInt(salaryStr.replace(/[^0-9]/g, '')) * 1000;
      return [0, max];
    }
    if (salaryStr.startsWith('Over')) {
      const min = parseInt(salaryStr.replace(/[^0-9]/g, '')) * 1000;
      return [min, Infinity];
    }
    const match = salaryStr.match(/\$?([\d,]+)K\s*-\s*\$?([\d,]+)K/);
    if (match) {
      const min = parseInt(match[1].replace(/,/g, '')) * 1000;
      const max = parseInt(match[2].replace(/,/g, '')) * 1000;
      return [min, max];
    }
    return [null, null];
  };

  useEffect(() => {
    const fetchJobs = async () => {
      const apiUrl = isHome ? '/api/jobs?_limit=3' : '/api/jobs';
      try {
        const res = await fetch(apiUrl);
        const data = await res.json();
        setJobs(data);
        setFilteredJobs(data);
      } catch (error) {
        console.log('Error fetching data', error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [isHome]);

 const matchSalaryFilter = (filterSalary, jobSalary) => {
  if (!filterSalary || !jobSalary) return true;

  let min = 0, max = Infinity;

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
  let jobMin = 0, jobMax = 0;
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

  // Inclusive overlap
  return jobMin <= max && jobMax >= min;
};


  // Filter jobs based on URL parameters (from homepage filters)
  useEffect(() => {
    if (!isHome && jobs.length > 0) {
      const searchParams = new URLSearchParams(location.search);
      const keyword = searchParams.get('keyword') || '';
      const salary = searchParams.get('salary') || '';
      const locationFilter = searchParams.get('location') || '';

      let filtered = jobs;

      // Apply keyword filter
      // Keep only jobs where keyword matches in title, company name, description, or type
      if (keyword) {
        // Array.filter() is a built-in method that loops through an array and
        // returns only the elements that pass a test (true condition).
        // String.toLowerCase() makes text lowercase so search is case-insensitive.
        // String.includes() checks if one string is found inside another (returns true/false).
        filtered = filtered.filter((job) =>
          job.title.toLowerCase().includes(keyword.toLowerCase()) ||
          job.company.name.toLowerCase().includes(keyword.toLowerCase()) ||
          job.description.toLowerCase().includes(keyword.toLowerCase()) ||
          job.type.toLowerCase().includes(keyword.toLowerCase())
        );
      }

      // Apply salary filter
      if (salary) {
        const [filterMin, filterMax] = parseSalaryRange(salary);
        filtered = filtered.filter((job) => {
          const [jobMin, jobMax] = parseSalaryRange(job.salary);
          // Check for overlap between filter and job salary ranges
          return (
            filterMin !== null &&
            filterMax !== null &&
            jobMin !== null &&
            jobMax !== null &&
            jobMax >= filterMin &&
            jobMin <= filterMax
          );
        });
      }

      // Apply location filter
      if (locationFilter) {
        filtered = filtered.filter((job) =>
          job.location.toLowerCase().includes(locationFilter.toLowerCase())
        );
      }

      setFilteredJobs(filtered);
    }
  }, [location.search, jobs, isHome]);

  // Get current filter values for display
  const getFilterInfo = () => {
    const searchParams = new URLSearchParams(location.search);
    return {
      keyword: searchParams.get('keyword') || '',
      salary: searchParams.get('salary') || '',
      location: searchParams.get('location') || ''
    };
  };

  const filters = getFilterInfo();
  const hasFilters = filters.keyword || filters.salary || filters.location;

  return (
    <section className='bg-blue-50 px-4 py-10'>
      <div className='container-xl lg:container m-auto'>
        <h2 className='text-3xl font-bold text-indigo-500 mb-6 text-center'>
          {isHome ? 'Recent Jobs' : 'Browse Jobs'}
        </h2>

        {loading ? (
          <Spinner loading={loading} />
        ) : (
          <>
            {/* Active Filters */}
            {!isHome && hasFilters && (
              <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6 max-w-4xl mx-auto">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="text-sm font-medium text-gray-600">Active Filters:</span>

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
                  Found {filteredJobs.length} job{filteredJobs.length !== 1 ? 's' : ''}
                  {hasFilters && ' matching your criteria'}
                </p>
              </div>
            )}

            {/* Jobs List */}
            {filteredJobs.length > 0 ? (
              <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                {filteredJobs.map((job) => (
                  <JobListing key={job.id} job={job} />
                ))}
              </div>
            ) : (
              !isHome && (
                <div className="text-center py-12">
                  <div className="max-w-md mx-auto">
                    <div className="text-6xl text-gray-300 mb-4">🔍</div>
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">
                      No Jobs Found
                    </h3>
                    <p className="text-gray-500 mb-6">
                      {hasFilters
                        ? "No jobs match your current filter criteria. Try adjusting your search."
                        : "No jobs are currently available."}
                    </p>
                    {hasFilters && (
                      <a
                        href="/jobs"
                        className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                      >
                        View All Jobs
                      </a>
                    )}
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
