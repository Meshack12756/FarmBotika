import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useNavigate } from "react-router-dom";

const ProfilePrompt = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkProfile = async () => {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id;

      if (!userId) return;

      const { data: profile } = await supabase
        .from("farmers")
        .select("*")
        .eq("id", userId)
        .single();

      // Show prompt only if profile doesn't exist
      if (!profile) {
        setShowPrompt(true);
      }
    };

    checkProfile();
  }, []);

  if (!showPrompt) return null;

  return (
    <div className="mb-6 border border-yellow-300 bg-yellow-50 p-4 rounded-xl text-yellow-800 shadow-sm font-poppins">
      <h2 className="font-semibold text-lg mb-1">👋 Welcome!</h2>
      <p className="text-sm mb-3">
        Before diving into your crops and insights, please take a moment to
        complete your profile. This helps us personalize your experience.
      </p>
      <button
        onClick={() => navigate("/onboarding")}
        className="bg-yellow-700 text-white px-5 py-2 rounded-full text-sm hover:bg-yellow-800"
      >
        Complete Profile
      </button>
    </div>
  );
};

export default ProfilePrompt;
