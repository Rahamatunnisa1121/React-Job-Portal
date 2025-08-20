import {
  Route,
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
} from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import MainLayout from "./layouts/MainLayout";
import HomePage from "./pages/HomePage";
import JobsPage from "./pages/JobsPage";
import NotFoundPage from "./pages/NotFoundPage";
import JobPage, { jobLoader } from "./pages/JobPage";
import AddJobPage from "./pages/AddJobPage";
import EditJobPage from "./pages/EditJobPage";
import Login from "./components/Login";
import Signup from "./components/signup";
import ProtectedRoute from "./components/ProtectedRoute";
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
        {/* Login route - outside MainLayout */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Main app routes - wrapped with MainLayout */}
        <Route path="/" element={<MainLayout />}>
          <Route
            index
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/jobs"
            element={
              <ProtectedRoute>
                <JobsPage />
              </ProtectedRoute>
            }
          />

          {/* Add Job - Only employers can access */}
          <Route
            path="/add-job"
            element={
              <ProtectedRoute allowedRoles={["employer"]}>
                <AddJobPage addJobSubmit={addJob} />
              </ProtectedRoute>
            }
          />

          {/* Edit Job - Only employers can access */}
          <Route
            path="/edit-job/:id"
            element={
              <ProtectedRoute allowedRoles={["employer"]}>
                <EditJobPage updateJobSubmit={updateJob} />
              </ProtectedRoute>
            }
            loader={jobLoader}
          />
          

          {/* View Job - All authenticated users */}
          <Route
            path="/jobs/:id"
            element={
              <ProtectedRoute>
                <JobPage deleteJob={deleteJob} />
              </ProtectedRoute>
            }
            loader={jobLoader}
          />

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
