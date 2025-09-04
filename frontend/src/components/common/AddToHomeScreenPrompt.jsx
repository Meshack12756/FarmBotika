import React, { useEffect, useState } from "react";

const AddToHomeScreenPrompt = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const shouldShow = localStorage.getItem("showA2HS") === "true";
    setShow(shouldShow);
  }, []);

  const handleInstall = async () => {
    const promptEvent = window.deferredPrompt;
    if (promptEvent) {
      promptEvent.prompt();
      const result = await promptEvent.userChoice;
      if (result.outcome === "accepted") {
        console.log("User installed PWA");
      }
      setShow(false);
      localStorage.setItem("showA2HS", "false");
    }
  };

  const handleDismiss = () => {
    setShow(false);
    localStorage.setItem("showA2HS", "false");
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-green-700 text-white px-6 py-3 rounded shadow-lg z-50 flex items-center gap-4">
      <div>
        <p className="font-semibold">Install FarmBotika?</p>
        <p className="text-sm">Add to your home screen for offline access.</p>
      </div>
      <div className="flex gap-2">
        <button
          onClick={handleInstall}
          className="bg-white text-green-800 px-3 py-1 rounded text-sm font-semibold hover:bg-gray-100"
        >
          Install
        </button>
        <button
          onClick={handleDismiss}
          className="text-white text-sm hover:underline"
        >
          Not now
        </button>
      </div>
    </div>
  );
};

export default AddToHomeScreenPrompt;
