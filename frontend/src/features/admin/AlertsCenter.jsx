const AlertsCenter = () => (
  <div className="bg-white border border-green-200 rounded-xl p-6 shadow-sm mb-10">
    <h2 className="text-xl font-semibold text-green-700 mb-4">
      🚨 Alerts Center
    </h2>
    <textarea
      placeholder="Type system-wide message..."
      className="w-full h-32 rounded-lg border border-green-300 p-4 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
    />
    <button className="mt-4 bg-yellow-500 text-white px-4 py-2 rounded-full hover:bg-yellow-600 transition">
      Send Alert
    </button>
  </div>
);

export default AlertsCenter;
