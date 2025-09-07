import React from "react";
import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom";

const FarmerDashboard = () => (
  <div className="flex min-h-screen font-poppins">
    <Sidebar />
    <main className="flex-1 bg-gradient-to-br from-green-50 via-white to-lime-100 p-6">
      <Outlet />
    </main>
  </div>
);

export default FarmerDashboard;
