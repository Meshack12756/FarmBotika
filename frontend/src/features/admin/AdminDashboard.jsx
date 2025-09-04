import RoleManager from "./RoleManager";
import UserInsights from "./UserInsights";
import AuditLogs from "./AuditLogs";
import AlertsCenter from "./AlertsCenter";

const AdminDashboard = () => (
  <div className="min-h-screen p-8 font-poppins bg-gradient-to-br from-gray-50 via-white to-green-50">
    <h1 className="text-3xl font-bold text-green-800 mb-6">
      🔐 Admin Dashboard
    </h1>
    <UserInsights />
    <AuditLogs />
    <RoleManager />
    <AlertsCenter />
  </div>
);

export default AdminDashboard;
