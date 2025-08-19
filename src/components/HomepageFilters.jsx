import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaMapMarkerAlt, FaDollarSign } from 'react-icons/fa';

const HomepageFilters = () => {
  const [keyword, setKeyword] = useState('');
  const [salary, setSalary] = useState('');
  const [location, setLocation] = useState('');
  const navigate = useNavigate();

  const salaryRanges = [
    { value: '', label: 'Any Salary' },
    { value: 'Under $50K', label: 'Under $50K' },
    { value: '$50K - 60K', label: '$50K - $60K' },
    { value: '$60K - 70K', label: '$60K - $70K' },
    { value: '$70K - 80K', label: '$70K - $80K' },
    { value: '$80K - 90K', label: '$80K - $90K' },
    { value: '$90K - 100K', label: '$90K - $100K' },
    { value: '$100K - 125K', label: '$100K - $125K' },
    { value: '$125K - 150K', label: '$125K - $150K' },
    { value: '$150K - 175K', label: '$150K - $175K' },
    { value: '$175K - 200K', label: '$175K - $200K' },
    { value: 'Over $200K', label: 'Over $200K' }
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    
    // Create URL parameters for the search
    const params = new URLSearchParams();
    if (keyword.trim()) params.append('keyword', keyword.trim());
    if (salary) params.append('salary', salary);
    if (location.trim()) params.append('location', location.trim());

    // Navigate to jobs page with search parameters
    const queryString = params.toString();
    navigate(`/jobs${queryString ? `?${queryString}` : ''}`);
  };

  return (
    <section className="bg-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-black mb-2">
            Find Your Dream Job
          </h2>
          <p className="text-blue-700">
            Search thousands of jobs with our advanced filters
          </p>
        </div>

        <div className="bg-indigo-100 rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
          <form onSubmit={handleSearch}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {/* Keyword Search */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaSearch className="inline mr-2 text-gray-500" />
                  Job Title or Keywords
                </label>
                <input
                  type="text"
                  placeholder="e.g. Developer, Designer, Manager"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                />
              </div>

              {/* Salary Filter */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaDollarSign className="inline mr-2 text-gray-500" />
                  Salary Range
                </label>
                <select
                  value={salary}
                  onChange={(e) => setSalary(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white"
                >
                  {salaryRanges.map((range) => (
                    <option key={range.value} value={range.value}>
                      {range.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Location Filter */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaMapMarkerAlt className="inline mr-2 text-gray-500" />
                  Location
                </label>
                <input
                  type="text"
                  placeholder="e.g. New York, Remote, California"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                />
              </div>
            </div>

            {/* Search Button */}
            <div className="text-center">
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                <FaSearch className="inline mr-2" />
                Search Jobs
              </button>
              
              {/* Clear Filters */}
              {(keyword || salary || location) && (
                <button
                  type="button"
                  onClick={() => {
                    setKeyword('');
                    setSalary('');
                    setLocation('');
                  }}
                  className="ml-4 text-gray-500 hover:text-gray-700 underline"
                >
                  Clear All
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default HomepageFilters;