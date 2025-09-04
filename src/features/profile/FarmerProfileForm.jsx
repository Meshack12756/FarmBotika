import React, { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { useNavigate } from "react-router-dom";

const FarmerProfileForm = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    region: "",
    language: "",
    crops: "",
    image: null,
  });

  const [previewUrl, setPreviewUrl] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("farmerForm");
    if (saved) setFormData(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("farmerForm", JSON.stringify(formData));
  }, [formData]);

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);

      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error || !session?.user?.id) {
        setFeedback("🔒 Session expired. Please log in again.");
        setLoading(false);
        setTimeout(() => navigate("/login"), 2000);
        return;
      }

      const uid = session.user.id;

      const { data: profile, error: profileError } = await supabase
        .from("farmers")
        .select("*")
        .eq("id", uid)
        .single();

      if (profileError) {
        console.error("Profile fetch error:", profileError.message);
      }

      if (profile) {
        setFormData((prev) => ({
          ...prev,
          fullName: profile.full_name || "",
          region: profile.region || "",
          language: profile.preferred_lang || "",
          crops: profile.crops?.join(", ") || "",
        }));
        setPreviewUrl(profile.avatar_url || null);
        setIsUpdating(true);
      }

      setLoading(false);
    };

    loadProfile();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image" && files[0]) {
      setFormData({ ...formData, image: files[0] });
      setPreviewUrl(URL.createObjectURL(files[0]));
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const getInitials = (name) =>
    name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedback("");

    try {
      const {
        data: { session },
        error: authError,
      } = await supabase.auth.getSession();

      if (authError || !session?.user?.id)
        throw new Error("Session expired. Please log in.");
      const uid = session.user.id;

      let avatarUrl = previewUrl;

      if (formData.image) {
        const ext = formData.image.name.split(".").pop();
        const fileName = `${formData.fullName
          .replace(/\s+/g, "-")
          .toLowerCase()}-${Date.now()}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(fileName, formData.image, { upsert: true });

        if (uploadError) {
          console.error("Upload error:", uploadError.message);
          throw uploadError;
        }

        const { data: urlData } = supabase.storage
          .from("avatars")
          .getPublicUrl(fileName);

        avatarUrl = urlData?.publicUrl || null;
      }

      const cropArray = formData.crops
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean);

      const payload = {
        id: uid,
        full_name: formData.fullName,
        region: formData.region,
        preferred_lang: formData.language,
        crops: cropArray,
        avatar_url: avatarUrl,
        ...(isUpdating && { updated_at: new Date().toISOString() }),
      };

      const response = isUpdating
        ? await supabase.from("farmers").update(payload).eq("id", uid)
        : await supabase.from("farmers").insert([payload]);

      if (response.error) throw response.error;

      // ✅ Log profile change to history
      await supabase.from("profile_history").insert({
        user_id: uid,
        changes: payload,
      });

      setFeedback("✅ Profile saved!");
      localStorage.removeItem("farmerForm");

      // ✅ Stay signed in, redirect to dashboard
      navigate("/dashboard");
    } catch (err) {
      console.error("❌ Submission error:", err.message || err);
      setFeedback(`❌ ${err.message || "Failed to save profile."}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-10 text-center text-green-700">
        Loading your onboarding form...
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto mt-10 bg-white border border-green-200 p-6 rounded-xl shadow-lg font-poppins">
      <h2 className="text-2xl font-bold text-green-800 mb-6 text-center">
        🧑‍🌾 Farmer Onboarding
      </h2>

      {feedback && (
        <div className="text-center mb-4 text-sm px-4 py-2 rounded-full font-medium bg-green-50 text-green-700 border border-green-300">
          {feedback}
        </div>
      )}

      <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="flex justify-center mb-4">
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Preview"
              className="w-16 h-16 rounded-full object-cover"
            />
          ) : (
            <div className="w-16 h-16 flex items-center justify-center rounded-full bg-green-100 text-green-700 font-bold text-xl">
              {getInitials(formData.fullName || "F")}
            </div>
          )}
        </div>

        <input
          type="text"
          name="fullName"
          placeholder="Full Name"
          value={formData.fullName}
          onChange={handleChange}
          required
          className="w-full px-4 py-3 text-black border rounded-full border-green-300 focus:ring-2 focus:ring-green-400 text-sm"
        />

        <select
          name="region"
          value={formData.region}
          onChange={handleChange}
          required
          className="w-full px-4 py-3 text-black border rounded-full border-green-300 focus:ring-2 focus:ring-green-400 text-sm"
        >
          <option value="">Select Region</option>
          <option value="Nairobi">Nairobi</option>
          <option value="Western">Western</option>
          <option value="Rift Valley">Rift Valley</option>
          <option value="Coastal">Coastal</option>
        </select>

        <select
          name="language"
          value={formData.language}
          onChange={handleChange}
          required
          className="w-full px-4 py-3 text-black border rounded-full border-green-300 focus:ring-2 focus:ring-green-400 text-sm"
        >
          <option value="">Preferred Language</option>
          <option value="English">English</option>
          <option value="Swahili">Swahili</option>
          <option value="Kikuyu">Kikuyu</option>
          <option value="Kalenjin">Kalenjin</option>
        </select>

        <input
          type="text"
          name="crops"
          placeholder="Crops you grow (comma-separated)"
          value={formData.crops}
          onChange={handleChange}
          required
          className="w-full px-4 py-3 text-black border rounded-full border-green-300 focus:ring-2 focus:ring-green-400 text-sm"
        />

        <input
          type="file"
          name="image"
          accept="image/*"
          onChange={handleChange}
          className="w-full px-4 py-2 text-sm text-green-700"
        />

        <button
          type="submit"
          disabled={submitting}
          className={`w-full bg-green-700 text-white py-3 rounded-full font-semibold hover:bg-green-800 transition ${
            submitting ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {submitting
            ? "Saving..."
            : isUpdating
            ? "Update Profile"
            : "Create Profile"}
        </button>
      </form>
    </div>
  );
};

export default FarmerProfileForm;
