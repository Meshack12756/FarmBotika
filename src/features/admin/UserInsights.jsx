import React, { useEffect, useState } from "react";
import { fetchStats } from "./api/adminService";

const UserInsights = () => {
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchStats()
      .then((res) => {
        setStats(res.data);
      })
      .catch(() => {
        setError("Failed to load user statistics.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-3 mb-10 text-green-700">
        <div>Loading stats...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-700 p-4 bg-red-50 border border-red-300 rounded mb-10">
        {error}
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-3 mb-10">
      <StatCard title="👥 Total Users" value={stats.total_users || 0} />
      <StatCard title="🧑‍💼 Staff Accounts" value={stats.staff_count || 0} />
      <StatCard title="🧑‍🌾 Farmers Registered" value={stats.farmer_count || 0} />
    </div>
  );
};

const StatCard = ({ title, value }) => (
  <div className="bg-white border border-green-200 rounded-xl p-6 shadow-sm">
    <h2 className="text-xl font-semibold text-green-700">{title}</h2>
    <p className="text-3xl font-bold mt-2 text-green-900">{value}</p>
  </div>
);

export default UserInsights;
