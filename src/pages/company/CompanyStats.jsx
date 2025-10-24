import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  ArrowLeft,
  Users,
  DollarSign,
  TrendingUp,
  Briefcase,
  Award,
  Activity,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

const CompanyStats = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [employers, setEmployers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [designationData, setDesignationData] = useState([]);
  const [salaryRangeData, setSalaryRangeData] = useState([]);
  const [stats, setStats] = useState({
    totalEmployers: 0,
    totalSalary: 0,
    avgSalary: 0,
    highestSalary: 0,
    lowestSalary: 0,
  });

  const COLORS = [
    "#3B82F6", // blue
    "#8B5CF6", // purple
    "#10B981", // green
    "#F59E0B", // orange
    "#EF4444", // red
    "#EC4899", // pink
    "#6366F1", // indigo
    "#14B8A6", // teal
  ];

  useEffect(() => {
    fetchEmployersData();
  }, []);

  const fetchEmployersData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/employers?companyId=${user.id}`);
      if (!response.ok) throw new Error("Failed to fetch employers");

      const employersData = await response.json();
      setEmployers(employersData);

      // Calculate designation distribution
      const designationCount = {};
      employersData.forEach((emp) => {
        const designation = emp.designation || "Unassigned";
        designationCount[designation] =
          (designationCount[designation] || 0) + 1;
      });

      const designationChartData = Object.entries(designationCount).map(
        ([name, value]) => ({ name, value })
      );
      setDesignationData(designationChartData);

      // Calculate salary ranges
      const employersWithSalary = employersData.filter(
        (emp) => emp.salary && emp.salary > 0
      );

      const salaryRanges = {
        "0-50K": 0,
        "50K-100K": 0,
        "100K-150K": 0,
        "150K-200K": 0,
        "200K+": 0,
      };

      employersWithSalary.forEach((emp) => {
        const salary = emp.salary;
        if (salary < 50000) salaryRanges["0-50K"]++;
        else if (salary < 100000) salaryRanges["50K-100K"]++;
        else if (salary < 150000) salaryRanges["100K-150K"]++;
        else if (salary < 200000) salaryRanges["150K-200K"]++;
        else salaryRanges["200K+"]++;
      });

      const salaryChartData = Object.entries(salaryRanges)
        .filter(([_, count]) => count > 0)
        .map(([range, count]) => ({ range, count }));
      setSalaryRangeData(salaryChartData);

      // Calculate stats
      const totalSalary = employersWithSalary.reduce(
        (sum, emp) => sum + emp.salary,
        0
      );
      const avgSalary =
        employersWithSalary.length > 0
          ? Math.round(totalSalary / employersWithSalary.length)
          : 0;
      const salaries = employersWithSalary.map((emp) => emp.salary);
      const highestSalary = salaries.length > 0 ? Math.max(...salaries) : 0;
      const lowestSalary = salaries.length > 0 ? Math.min(...salaries) : 0;

      setStats({
        totalEmployers: employersData.length,
        totalSalary,
        avgSalary,
        highestSalary,
        lowestSalary,
      });
    } catch (error) {
      console.error("Error fetching employers data:", error);
      alert("Failed to load statistics");
    } finally {
      setLoading(false);
    }
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white px-4 py-2 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-900">{payload[0].name}</p>
          <p className="text-blue-600 font-bold">
            {payload[0].value}{" "}
            {payload[0].value === 1 ? "employee" : "employees"}
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomSalaryTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white px-4 py-2 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-900">
            {payload[0].payload.range}
          </p>
          <p className="text-green-600 font-bold">
            {payload[0].value}{" "}
            {payload[0].value === 1 ? "employee" : "employees"}
          </p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Loading statistics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/company-dashboard")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors font-medium"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </button>
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-xl p-8 text-white">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Activity className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-4xl font-bold mb-2">Company Statistics</h1>
                <p className="text-blue-100 text-lg">
                  Comprehensive analytics and insights
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Key Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
              Total Employers
            </p>
            <p className="text-3xl font-bold text-gray-900 mt-1">
              {stats.totalEmployers}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
              Avg Salary
            </p>
            <p className="text-3xl font-bold text-gray-900 mt-1">
              ₹{stats.avgSalary.toLocaleString()}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
              Highest Salary
            </p>
            <p className="text-3xl font-bold text-gray-900 mt-1">
              ₹{stats.highestSalary.toLocaleString()}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Award className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
              Lowest Salary
            </p>
            <p className="text-3xl font-bold text-gray-900 mt-1">
              ₹{stats.lowestSalary.toLocaleString()}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-pink-600" />
              </div>
            </div>
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
              Total Payroll
            </p>
            <p className="text-3xl font-bold text-gray-900 mt-1">
              ₹{stats.totalSalary.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Designation Distribution - Pie Chart */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <Briefcase className="w-7 h-7 text-blue-600" />
              Employees by Designation
            </h2>
            {designationData.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">No designation data available</p>
              </div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={350}>
                  <PieChart>
                    <Pie
                      data={designationData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name} (${(percent * 100).toFixed(0)}%)`
                      }
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {designationData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>

                {/* Legend */}
                <div className="mt-6 grid grid-cols-2 gap-3">
                  {designationData.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 p-2 rounded-lg bg-gray-50"
                    >
                      <div
                        className="w-4 h-4 rounded"
                        style={{
                          backgroundColor: COLORS[index % COLORS.length],
                        }}
                      />
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {item.name}
                        </p>
                        <p className="text-xs text-gray-600">
                          {item.value}{" "}
                          {item.value === 1 ? "employee" : "employees"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Salary Range Distribution - Bar Chart */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <DollarSign className="w-7 h-7 text-green-600" />
              Salary Range Distribution
            </h2>
            {salaryRangeData.length === 0 ? (
              <div className="text-center py-12">
                <DollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">No salary data available</p>
              </div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={salaryRangeData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis
                      dataKey="range"
                      tick={{ fill: "#6B7280", fontSize: 12 }}
                      tickLine={{ stroke: "#E5E7EB" }}
                    />
                    <YAxis
                      tick={{ fill: "#6B7280", fontSize: 12 }}
                      tickLine={{ stroke: "#E5E7EB" }}
                      allowDecimals={false}
                    />
                    <Tooltip content={<CustomSalaryTooltip />} />
                    <Bar
                      dataKey="count"
                      fill="url(#colorGradient)"
                      radius={[8, 8, 0, 0]}
                    />
                    <defs>
                      <linearGradient
                        id="colorGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop offset="0%" stopColor="#10B981" stopOpacity={1} />
                        <stop
                          offset="100%"
                          stopColor="#059669"
                          stopOpacity={1}
                        />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>

                {/* Salary Range Summary */}
                <div className="mt-6 grid grid-cols-2 gap-3">
                  {salaryRangeData.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200"
                    >
                      <span className="font-semibold text-gray-900">
                        {item.range}
                      </span>
                      <span className="text-green-600 font-bold">
                        {item.count} {item.count === 1 ? "emp" : "emps"}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Detailed Breakdown Table */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mt-8 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <Users className="w-7 h-7 text-blue-600" />
            Employee Details
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-4 px-4 font-semibold text-gray-700 uppercase text-sm tracking-wide">
                    Name
                  </th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700 uppercase text-sm tracking-wide">
                    Designation
                  </th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700 uppercase text-sm tracking-wide">
                    Email
                  </th>
                  <th className="text-right py-4 px-4 font-semibold text-gray-700 uppercase text-sm tracking-wide">
                    Salary
                  </th>
                </tr>
              </thead>
              <tbody>
                {employers.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center py-12">
                      <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-600">No employees found</p>
                    </td>
                  </tr>
                ) : (
                  employers.map((employer, index) => (
                    <tr
                      key={employer.id}
                      className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                      }`}
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          {employer.profilePhoto ? (
                            <img
                              src={employer.profilePhoto}
                              alt={employer.name}
                              className="w-10 h-10 rounded-lg object-cover border-2 border-gray-200"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                              <Users className="w-5 h-5 text-blue-600" />
                            </div>
                          )}
                          <span className="font-semibold text-gray-900">
                            {employer.name}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-gray-700">
                        {employer.designation || "N/A"}
                      </td>
                      <td className="py-4 px-4 text-gray-600">
                        {employer.email}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span className="font-bold text-green-600">
                          {employer.salary
                            ? `₹${employer.salary.toLocaleString()}`
                            : "N/A"}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyStats;
