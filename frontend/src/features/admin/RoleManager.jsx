const RoleManager = () => (
  <div className="bg-white border border-green-200 rounded-xl p-6 shadow-sm mb-10">
    <h2 className="text-xl font-semibold text-green-700 mb-4">
      🔑 Role Manager
    </h2>
    <div className="flex flex-wrap gap-4">
      <button className="bg-green-700 text-white px-4 py-2 rounded-full hover:bg-green-800 transition">
        Promote Staff
      </button>
      <button className="bg-red-600 text-white px-4 py-2 rounded-full hover:bg-red-700 transition">
        Suspend Account
      </button>
    </div>
  </div>
);

export default RoleManager;
