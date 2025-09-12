
// API utility functions for consistent API handling

const API_BASE = '/api';

// Generic API request handler
const apiRequest = async (url, options = {}) => {
  try {
    const response = await fetch(`${API_BASE}${url}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    // Check if response has content
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }
    
    return null;
  } catch (error) {
    console.error('API Request failed:', error);
    throw error;
  }
};

// Jobs API
export const jobsAPI = {
  // Get all jobs
  getAll: () => apiRequest('/jobs'),
  
  // Get limited jobs (for homepage)
  getRecent: (limit = 3) => apiRequest(`/jobs?_limit=${limit}`),
  
  // Get job by ID
  getById: (id) => apiRequest(`/jobs/${id}`),
  
  // Get jobs by employer
  getByEmployer: (employerId) => apiRequest(`/jobs?employerId=${employerId}`),
  
  // Create new job
  create: (jobData) => apiRequest('/jobs', {
    method: 'POST',
    body: JSON.stringify(jobData),
  }),
  
  // Update job
  update: (id, jobData) => apiRequest(`/jobs/${id}`, {
    method: 'PUT',
    body: JSON.stringify(jobData),
  }),
  
  // Delete job
  delete: (id) => apiRequest(`/jobs/${id}`, {
    method: 'DELETE',
  }),
};

// Users API
export const usersAPI = {
  // Get all users
  getAll: () => apiRequest('/users'),
  
  // Get user by ID
  getById: (id) => apiRequest(`/users/${id}`),
  
  // Get user by email
  getByEmail: async (email) => {
    const users = await apiRequest('/users');
    return users.find(user => user.email === email);
  },
  
  // Create new user
  create: (userData) => apiRequest('/users', {
    method: 'POST',
    body: JSON.stringify(userData),
  }),
  
  // Update user
  update: (id, userData) => apiRequest(`/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(userData),
  }),
  
  // Delete user
  delete: (id) => apiRequest(`/users/${id}`, {
    method: 'DELETE',
  }),
};

// Applications API
export const applicationsAPI = {
  // Get all applications
  getAll: () => apiRequest('/applications'),
  
  // Get applications by developer
  getByDeveloper: (developerId) => apiRequest(`/applications?developerId=${developerId}`),
  
  // Get applications by job
  getByJob: (jobId) => apiRequest(`/applications?jobId=${jobId}`),
  
  // Get application by ID
  getById: (id) => apiRequest(`/applications/${id}`),
  
  // Create new application
  create: (applicationData) => apiRequest('/applications', {
    method: 'POST',
    body: JSON.stringify(applicationData),
  }),
  
  // Update application status
  updateStatus: (id, status) => apiRequest(`/applications/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  }),
  
  // Delete application
  delete: (id) => apiRequest(`/applications/${id}`, {
    method: 'DELETE',
  }),
};

// Saved Jobs API
export const savedJobsAPI = {
  // Get all saved jobs
  getAll: () => apiRequest('/savedJobs'),
  
  // Get saved jobs by developer
  getByDeveloper: (developerId) => apiRequest(`/savedJobs?developerId=${developerId}`),
  
  // Check if job is saved by developer
  isSaved: async (jobId, developerId) => {
    const savedJobs = await apiRequest(`/savedJobs?jobId=${jobId}&developerId=${developerId}`);
    return savedJobs.length > 0;
  },
  
  // Save a job
  save: (jobId, developerId) => apiRequest('/savedJobs', {
    method: 'POST',
    body: JSON.stringify({
      jobId,
      developerId,
      savedAt: new Date().toISOString(),
    }),
  }),
  
  // Remove saved job
  remove: async (jobId, developerId) => {
    const savedJobs = await apiRequest(`/savedJobs?jobId=${jobId}&developerId=${developerId}`);
    if (savedJobs.length > 0) {
      return apiRequest(`/savedJobs/${savedJobs[0].id}`, {
        method: 'DELETE',
      });
    }
  },
};

// Helper functions for common operations
export const helpers = {
  // Get job with application status for a developer
  getJobWithApplicationStatus: async (jobId, developerId) => {
    const [job, applications] = await Promise.all([
      jobsAPI.getById(jobId),
      applicationsAPI.getByJob(jobId),
    ]);
    
    const userApplication = applications.find(app => app.developerId === developerId);
    
    return {
      ...job,
      applicationStatus: userApplication ? userApplication.status : null,
      hasApplied: !!userApplication,
    };
  },
  
  // Get jobs with application counts (for employers)
  getJobsWithApplicationCounts: async (employerId) => {
    const [jobs, applications] = await Promise.all([
      jobsAPI.getByEmployer(employerId),
      applicationsAPI.getAll(),
    ]);
    
    return jobs.map(job => {
      const jobApplications = applications.filter(app => app.jobId === job.id);
      return {
        ...job,
        applicationCount: jobApplications.length,
        applications: jobApplications,
      };
    });
  },
  
  // Get developer's dashboard data
  getDeveloperDashboard: async (developerId) => {
    const [applications, savedJobs] = await Promise.all([
      applicationsAPI.getByDeveloper(developerId),
      savedJobsAPI.getByDeveloper(developerId),
    ]);
    
    const jobIds = [
      ...applications.map(app => app.jobId),
      ...savedJobs.map(saved => saved.jobId),
    ];
    
    const uniqueJobIds = [...new Set(jobIds)];
    const jobs = await Promise.all(uniqueJobIds.map(id => jobsAPI.getById(id)));
    
    return {
      applications: applications.map(app => ({
        ...app,
        job: jobs.find(job => job.id === app.jobId),
      })),
      savedJobs: savedJobs.map(saved => ({
        ...saved,
        job: jobs.find(job => job.id === saved.jobId),
      })),
    };
  },
};

export default {
  jobs: jobsAPI,
  users: usersAPI,
  applications: applicationsAPI,
  savedJobs: savedJobsAPI,
  helpers,
};