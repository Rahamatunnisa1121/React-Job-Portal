import {
  Route,
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import "react-quill/dist/quill.snow.css";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import MainLayout from "./layouts/MainLayout";
import HomePage from "./pages/HomePage";
import JobsPage from "./pages/JobsPage";
import NotFoundPage from "./pages/NotFoundPage";
import JobPage, { jobLoader } from "./pages/JobPage";
import AddJobPage from "./pages/AddJobPage";
import EditJobPage from "./pages/EditJobPage";
import Login from "./components/Login";
import Signup from "./components/signup";
import MyApplications from "./pages/MyApplications";
import Recommendations from "./pages/Recommendations";
import Profile from "./components/Profile";
import EmployerProfile from "./components/EmployerProfile";

// Company Pages
import CompanyDashboard from "./pages/company/CompanyDashboard";
import CompanyEmployers from "./pages/company/CompanyEmployers";
import CompanyStats from "./pages/company/CompanyStats";
import AddEmployer from "./pages/company/AddEmployer";
import CompanyProfile from "./pages/company/CompanyProfile";
import EditEmployer from "./pages/company/EditEmployer";

// Home Route Wrapper - Redirects companies to dashboard
const HomeRouteWrapper = () => {
  const { isCompany } = useAuth();

  if (isCompany()) {
    return <Navigate to="/company-dashboard" replace />;
  }

  return <HomePage />;
};

const App = () => {
  // Add New Job
  const addJob = async (newJob) => {
    const res = await fetch("/api/jobs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newJob),
    });
    return;
  };

  // Delete Job
  const deleteJob = async (id) => {
    const res = await fetch(`/api/jobs/${id}`, {
      method: "DELETE",
    });
    return;
  };

  // Update Job
  const updateJob = async (job) => {
    const res = await fetch(`/api/jobs/${job.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(job),
    });
    return;
  };

  const router = createBrowserRouter(
    createRoutesFromElements(
      <>
        {/* Public routes (outside MainLayout) */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected/Main routes (with MainLayout wrapper) */}
        <Route path="/" element={<MainLayout />}>
          {/* Home Route - Redirects companies to dashboard */}
          <Route index element={<HomeRouteWrapper />} />

          <Route path="profile" element={<Profile />} />
          <Route path="jobs" element={<JobsPage />} />

          <Route
            path="add-job"
            element={<AddJobPage addJobSubmit={addJob} />}
          />
          <Route
            path="edit-job/:id"
            element={<EditJobPage updateJobSubmit={updateJob} />}
            loader={jobLoader}
          />
          <Route path="/employer/:id" element={<EmployerProfile />} />
          <Route
            path="jobs/:id"
            element={<JobPage deleteJob={deleteJob} />}
            loader={jobLoader}
          />

          <Route path="myapplications" element={<MyApplications />} />
          <Route path="recommendations" element={<Recommendations />} />

          {/* Company Routes */}
          <Route path="company-dashboard" element={<CompanyDashboard />} />
          <Route path="company-employers" element={<CompanyEmployers />} />
          <Route path="company-stats" element={<CompanyStats />} />
          <Route path="add-employer" element={<AddEmployer />} />
          <Route path="company-profile" element={<CompanyProfile />} />
          <Route path="/edit-employer/:employerId" element={<EditEmployer />} />
          {/* Catch-all */}
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </>
    )
  );

  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
};

export default App;
