import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Edit,
  Trash2,
  Plus,
  Mail,
  Briefcase,
  Search,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

const CompanyEmployers = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [employers, setEmployers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteModal, setDeleteModal] = useState({
    show: false,
    employer: null,
  });

  useEffect(() => {
    fetchEmployers();
  }, []);

  const fetchEmployers = async () => {
    try {
      setLoading(true);
      // Fetch company data to get employer IDs
      const companyResponse = await fetch(`/api/companies/${user.id}`);
      if (!companyResponse.ok) throw new Error("Failed to fetch company data");

      const company = await companyResponse.json();
      const employerIds = company.employerIds || [];

      // Fetch all employers for this company
      const employersResponse = await fetch(
        `/api/employers?companyId=${user.id}`
      );
      if (!employersResponse.ok) throw new Error("Failed to fetch employers");

      const employersData = await employersResponse.json();
      setEmployers(employersData);
    } catch (error) {
      console.error("Error fetching employers:", error);
      alert("Failed to load employers");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (employerId) => {
    try {
      // Delete employer
      const deleteResponse = await fetch(`/api/employers/${employerId}`, {
        method: "DELETE",
      });

      if (!deleteResponse.ok) throw new Error("Failed to delete employer");

      // Update company's employerIds
      const companyResponse = await fetch(`/api/companies/${user.id}`);
      if (!companyResponse.ok) throw new Error("Failed to fetch company data");

      const company = await companyResponse.json();
      const updatedEmployerIds = company.employerIds.filter(
        (id) => id !== employerId
      );

      const updateResponse = await fetch(`/api/companies/${user.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          employerIds: updatedEmployerIds,
        }),
      });

      if (!updateResponse.ok) throw new Error("Failed to update company");

      // Refresh employers list
      await fetchEmployers();
      setDeleteModal({ show: false, employer: null });
      alert("Employer deleted successfully!");
    } catch (error) {
      console.error("Error deleting employer:", error);
      alert(`Failed to delete employer: ${error.message}`);
    }
  };

  const filteredEmployers = employers.filter(
    (employer) =>
      employer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employer.designation.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Loading employers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Manage Employers
              </h1>
              <p className="text-gray-600 mt-2">
                View and manage all employers in your company
              </p>
            </div>
            <button
              onClick={() => navigate("/add-employer")}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 flex items-center gap-2 font-medium transition-colors shadow-md"
            >
              <Plus className="w-5 h-5" />
              Add New Employer
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative mt-6">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name, email, or designation..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Employers Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            {filteredEmployers.length}{" "}
            {filteredEmployers.length === 1 ? "employer" : "employers"} found
          </p>
        </div>

        {/* Employers Grid */}
        {filteredEmployers.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchTerm ? "No employers found" : "No employers yet"}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm
                ? "Try adjusting your search terms"
                : "Get started by adding your first employer"}
            </p>
            {!searchTerm && (
              <button
                onClick={() => navigate("/add-employer")}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 inline-flex items-center gap-2 font-medium transition-colors"
              >
                <Plus className="w-5 h-5" />
                Add Your First Employer
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEmployers.map((employer) => (
              <div
                key={employer.id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden"
              >
                {/* Card Header with Photo */}
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-center">
                  {employer.profilePhoto ? (
                    <img
                      src={employer.profilePhoto}
                      alt={employer.name}
                      className="w-24 h-24 rounded-full object-cover border-4 border-white mx-auto shadow-lg"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center mx-auto shadow-lg">
                      <User className="w-12 h-12 text-blue-600" />
                    </div>
                  )}
                  <h3 className="text-xl font-bold text-white mt-4">
                    {employer.name}
                  </h3>
                </div>

                {/* Card Body */}
                <div className="p-6 space-y-3">
                  <div className="flex items-start gap-3">
                    <Briefcase className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-500">Designation</p>
                      <p className="text-gray-900 font-medium">
                        {employer.designation}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="text-gray-900 font-medium break-all">
                        {employer.email}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Card Footer - Actions */}
                <div className="px-6 pb-6 flex gap-3">
                  <button
                    onClick={() => navigate(`/edit-employer/${employer.id}`)}
                    className="flex-1 bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 font-medium transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => setDeleteModal({ show: true, employer })}
                    className="flex-1 bg-red-600 text-white px-4 py-2.5 rounded-lg hover:bg-red-700 flex items-center justify-center gap-2 font-medium transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  Delete Employer
                </h3>
                <p className="text-gray-600 text-sm">
                  This action cannot be undone
                </p>
              </div>
            </div>

            <p className="text-gray-700 mb-6">
              Are you sure you want to delete{" "}
              <span className="font-semibold">
                {deleteModal.employer?.name}
              </span>
              ? All their data will be permanently removed.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setDeleteModal({ show: false, employer: null })}
                className="flex-1 bg-gray-200 text-gray-700 px-4 py-2.5 rounded-lg hover:bg-gray-300 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteModal.employer.id)}
                className="flex-1 bg-red-600 text-white px-4 py-2.5 rounded-lg hover:bg-red-700 font-medium transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyEmployers;
