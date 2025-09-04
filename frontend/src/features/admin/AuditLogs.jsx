const AuditLogs = () => (
  <div className="bg-white border border-green-200 rounded-xl p-6 shadow-sm mb-10">
    <h2 className="text-xl font-semibold text-green-700 mb-2">
      📜 Recent Login Logs
    </h2>
    <ul className="text-sm text-green-700 space-y-2">
      <li>✅ Farmer John logged in at 10:03am</li>
      <li>✅ Staff Joyce reset her password</li>
      <li>⚠️ Failed login attempt for system.admin@farmbotika.com</li>
    </ul>
  </div>
);

export default AuditLogs;
