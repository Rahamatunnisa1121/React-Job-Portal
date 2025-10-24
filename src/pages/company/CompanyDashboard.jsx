import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  Users,
  Briefcase,
  TrendingUp,
  Calendar,
  DollarSign,
  UserPlus,
  Edit,
  BarChart3,
  Settings,
  ArrowRight,
  Award,
  Activity,
  Clock,
  MapPin,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

const CompanyDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [companyData, setCompanyData] = useState(null);
  const [employers, setEmployers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEmployers: 0,
    departments: 0,
    avgSalary: 0,
    activeProjects: 0,
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch company data
      const companyResponse = await fetch(`/api/companies/${user.id}`);
      if (!companyResponse.ok) throw new Error("Failed to fetch company data");
      const company = await companyResponse.json();
      setCompanyData(company);

      // Fetch employers
      const employersResponse = await fetch(
        `/api/employers?companyId=${user.id}`
      );
      if (!employersResponse.ok) throw new Error("Failed to fetch employers");
      const employersData = await employersResponse.json();
      setEmployers(employersData);

      // Calculate stats
      const totalEmployers = employersData.length;

      // Calculate unique departments from designations
      const uniqueDepartments = new Set(
        employersData.map((emp) => emp.designation?.split(" ")[0] || "General")
      ).size;

      // Calculate average salary
      const employersWithSalary = employersData.filter(
        (emp) => emp.salary && emp.salary > 0
      );
      const totalSalary = employersWithSalary.reduce(
        (sum, emp) => sum + emp.salary,
        0
      );
      const avgSalary =
        employersWithSalary.length > 0
          ? Math.round(totalSalary / employersWithSalary.length)
          : 0;

      setStats({
        totalEmployers,
        departments: uniqueDepartments,
        avgSalary,
        activeProjects: 0, // You can fetch this from projects API
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      alert("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const quickActions = [
    {
      title: "Add Employer",
      description: "Create new employer account",
      icon: UserPlus,
      color: "from-blue-500 to-blue-600",
      hoverColor: "hover:from-blue-600 hover:to-blue-700",
      bgColor: "from-blue-50 to-blue-100",
      borderColor: "border-blue-200",
      route: "/add-employer",
    },
    {
      title: "Edit Profile",
      description: "Update company information",
      icon: Edit,
      color: "from-purple-500 to-purple-600",
      hoverColor: "hover:from-purple-600 hover:to-purple-700",
      bgColor: "from-purple-50 to-purple-100",
      borderColor: "border-purple-200",
      route: "/company-profile",
    },
    {
      title: "View Reports",
      description: "Analytics and statistics",
      icon: BarChart3,
      color: "from-green-500 to-green-600",
      hoverColor: "hover:from-green-600 hover:to-green-700",
      bgColor: "from-green-50 to-green-100",
      borderColor: "border-green-200",
      route: "/company-stats",
    },
    {
      title: "Manage Employers",
      description: "View and edit employers",
      icon: Users,
      color: "from-orange-500 to-orange-600",
      hoverColor: "hover:from-orange-600 hover:to-orange-700",
      bgColor: "from-orange-50 to-orange-100",
      borderColor: "border-orange-200",
      route: "/company-employers",
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 text-xl font-semibold">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-purple-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              {companyData?.companyPhoto ? (
                <img
                  src={companyData.companyPhoto}
                  alt={companyData.name}
                  className="w-24 h-24 rounded-2xl object-cover border-4 border-white/30 shadow-2xl"
                />
              ) : (
                <div className="w-24 h-24 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center border-4 border-white/30 shadow-2xl">
                  <Building2 className="w-12 h-12 text-white" />
                </div>
              )}
              <div>
                <p className="text-blue-100 text-lg mb-1">{getGreeting()},</p>
                <h1 className="text-5xl font-bold mb-2">
                  {companyData?.name}!
                </h1>
                <p className="text-blue-100 text-lg flex items-center gap-2">
                  <Briefcase className="w-5 h-5" />
                  {companyData?.industry}
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate("/company-profile")}
              className="bg-white text-blue-600 px-6 py-3 rounded-xl hover:bg-blue-50 flex items-center gap-2 font-semibold transition-all shadow-xl hover:shadow-2xl hover:scale-105"
            >
              <Settings className="w-5 h-5" />
              Settings
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Company Info Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <Building2 className="w-7 h-7 text-blue-600" />
            Company Overview
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                    Company Name
                  </p>
                  <p className="text-lg font-bold text-gray-900">
                    {companyData?.name}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <Briefcase className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                    Industry
                  </p>
                  <p className="text-lg font-bold text-gray-900">
                    {companyData?.industry}
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                    Company ID
                  </p>
                  <p className="text-lg font-bold text-gray-900">
                    {companyData?.id}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                    Description
                  </p>
                  <p className="text-lg font-bold text-gray-900 line-clamp-2">
                    {companyData?.description || "No description provided"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Employers */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-all duration-300 hover:shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Users className="w-8 h-8" />
              </div>
              <Activity className="w-6 h-6 text-white/60" />
            </div>
            <p className="text-blue-100 text-sm font-semibold uppercase tracking-wide mb-1">
              Total Employers
            </p>
            <p className="text-4xl font-bold mb-2">{stats.totalEmployers}</p>
            <div className="flex items-center gap-2 text-blue-100 text-sm">
              <TrendingUp className="w-4 h-4" />
              <span>Active accounts</span>
            </div>
          </div>

          {/* Departments */}
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-all duration-300 hover:shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Briefcase className="w-8 h-8" />
              </div>
              <Activity className="w-6 h-6 text-white/60" />
            </div>
            <p className="text-purple-100 text-sm font-semibold uppercase tracking-wide mb-1">
              Departments
            </p>
            <p className="text-4xl font-bold mb-2">{stats.departments}</p>
            <div className="flex items-center gap-2 text-purple-100 text-sm">
              <Award className="w-4 h-4" />
              <span>Unique roles</span>
            </div>
          </div>

          {/* Average Salary */}
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-all duration-300 hover:shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <DollarSign className="w-8 h-8" />
              </div>
              <Activity className="w-6 h-6 text-white/60" />
            </div>
            <p className="text-green-100 text-sm font-semibold uppercase tracking-wide mb-1">
              Avg Salary
            </p>
            <p className="text-4xl font-bold mb-2">
              {stats.avgSalary > 0
                ? `$${stats.avgSalary.toLocaleString()}`
                : "N/A"}
            </p>
            <div className="flex items-center gap-2 text-green-100 text-sm">
              <TrendingUp className="w-4 h-4" />
              <span>Per employee</span>
            </div>
          </div>

          {/* Active Projects */}
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-all duration-300 hover:shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <BarChart3 className="w-8 h-8" />
              </div>
              <Activity className="w-6 h-6 text-white/60" />
            </div>
            <p className="text-orange-100 text-sm font-semibold uppercase tracking-wide mb-1">
              Active Projects
            </p>
            <p className="text-4xl font-bold mb-2">
              {stats.activeProjects || "0"}
            </p>
            <div className="flex items-center gap-2 text-orange-100 text-sm">
              <Clock className="w-4 h-4" />
              <span>In progress</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <Award className="w-7 h-7 text-blue-600" />
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={() => navigate(action.route)}
                className={`group relative overflow-hidden bg-gradient-to-br ${action.bgColor} border-2 ${action.borderColor} rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:scale-105`}
              >
                <div
                  className={`w-12 h-12 bg-gradient-to-r ${action.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`}
                >
                  <action.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-1">
                  {action.title}
                </h3>
                <p className="text-gray-600 text-sm mb-3">
                  {action.description}
                </p>
                <div className="flex items-center text-gray-700 font-semibold text-sm">
                  <span>Go</span>
                  <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Employers */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <Users className="w-7 h-7 text-blue-600" />
              Recent Employers
            </h2>
            <button
              onClick={() => navigate("/company-employers")}
              className="text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-2 hover:gap-3 transition-all"
            >
              View All
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          {employers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No employers yet
              </h3>
              <p className="text-gray-600 mb-6">
                Get started by adding your first employer
              </p>
              <button
                onClick={() => navigate("/add-employer")}
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 inline-flex items-center gap-2 font-semibold transition-all shadow-lg hover:shadow-xl"
              >
                <UserPlus className="w-5 h-5" />
                Add First Employer
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {employers.slice(0, 6).map((employer) => (
                <div
                  key={employer.id}
                  className="flex items-center gap-4 p-4 bg-gradient-to-br from-gray-50 to-white rounded-xl border-2 border-gray-100 hover:border-blue-200 hover:shadow-md transition-all group cursor-pointer"
                  onClick={() => navigate(`/edit-employer/${employer.id}`)}
                >
                  {employer.profilePhoto ? (
                    <img
                      src={employer.profilePhoto}
                      alt={employer.name}
                      className="w-14 h-14 rounded-xl object-cover border-2 border-gray-200 group-hover:border-blue-300 transition-all"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center border-2 border-blue-200">
                      <Users className="w-7 h-7 text-blue-600" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                      {employer.name}
                    </h3>
                    <p className="text-sm text-gray-600 truncate">
                      {employer.designation}
                    </p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompanyDashboard;
