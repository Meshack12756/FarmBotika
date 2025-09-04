import React from "react";
import AppRoutes from "./routes/AppRoutes";

import Navbar from "./components/layout/Navbar";
import AddToHomeScreenPrompt from "./components/common/AddToHomeScreenPrompt";

const App = () => {
  return (
    <div className="flex flex-col h-screen">
      <Navbar />
      <main className="flex-1 overflow-hidden bg-gradient-to-br from-lime-100 via-green-100 to-white">
        <AppRoutes />
      </main>
      <AddToHomeScreenPrompt />
    </div>
  );
};

export default App;
