import { useState } from "react";

const PestDiseaseDetector = () => {
  const [textInput, setTextInput] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [result, setResult] = useState(null);

  const handleSubmit = async () => {
    try {
      const formData = new FormData();
      formData.append("symptoms", textInput);
      if (imageFile) formData.append("image", imageFile);

      const res = await fetch("/pestscan/detect/", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error("Submission failed", err);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-md shadow-md p-6 space-y-6 text-gray-800">
      <h2 className="text-lg font-semibold text-green-700 flex items-center gap-2">
        <span role="img" aria-label="pest"></span>
        Pest & Disease Detection
      </h2>

      <textarea
        className="w-full border border-gray-300 rounded-md p-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        placeholder="Describe symptoms — e.g. yellowing leaves, soft stems, moldy patches..."
        value={textInput}
        onChange={(e) => setTextInput(e.target.value)}
        rows={4}
      />

      <input
        type="file"
        accept="image/*"
        onChange={(e) => setImageFile(e.target.files[0])}
        className="text-sm"
      />

      <button
        className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded transition duration-200"
        onClick={handleSubmit}
      >
        Submit for Analysis
      </button>

      {result && (
        <div className="bg-green-50 border border-green-200 rounded p-4 space-y-2">
          <p>
            <strong className="text-green-700">Diagnosis:</strong>{" "}
            {result.diagnosis || "N/A"}
          </p>
          <p>
            <strong className="text-green-700">Suggested Solution:</strong>{" "}
            {result.solution || "N/A"}
          </p>
        </div>
      )}
    </div>
  );
};

export default PestDiseaseDetector;
