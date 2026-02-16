import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import api from "../services/api";

export default function Profile() {
  const [profile, setProfile] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/profile")
      .then((pRes) => {
        setProfile(pRes.data.profile || {});
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    api.put("/profile", profile)
      .then(() => alert("Profile updated!"))
      .catch((err) => {
        console.error(err);
        const msg = err.response?.data?.error || err.message;
        const detail = err.response?.data?.detail || "";
        alert(`Failed to save: ${msg} ${detail ? "(" + detail + ")" : ""}`);
      });
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="bg-white p-6 rounded-xl shadow border">
        <h2 className="text-xl font-bold mb-4">Your Profile</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Full Name</label>
            <input
              name="full_name"
              value={profile.full_name || ""}
              onChange={handleChange}
              className="border p-2 rounded w-full mb-3"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Date of Birth (YYYY-MM-DD)</label>
            <input
              name="dob"
              value={profile.dob ? profile.dob.split('T')[0] : ""}
              onChange={handleChange}
              type="date"
              className="border p-2 rounded w-full mb-3"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Course</label>
            <input
              name="course"
              value={profile.course || ""}
              onChange={handleChange}
              className="border p-2 rounded w-full mb-3"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Year of Study</label>
            <input
              name="year_of_study"
              type="number"
              value={profile.year_of_study || ""}
              onChange={handleChange}
              className="border p-2 rounded w-full mb-3"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Annual Income</label>
            <input
              name="income"
              type="number"
              value={profile.income || ""}
              onChange={handleChange}
              className="border p-2 rounded w-full mb-3"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Caste Category</label>
            <select
              name="caste"
              value={profile.caste || ""}
              onChange={handleChange}
              className="border p-2 rounded w-full mb-3"
            >
              <option value="">Select...</option>
              <option value="General">General</option>
              <option value="OBC">OBC</option>
              <option value="SC">SC</option>
              <option value="ST">ST</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">10th Percentage</label>
            <input
              name="tenth_percentage"
              type="number"
              value={profile.tenth_percentage || ""}
              onChange={handleChange}
              className="border p-2 rounded w-full mb-3"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">12th Percentage</label>
            <input
              name="twelfth_percentage"
              type="number"
              value={profile.twelfth_percentage || ""}
              onChange={handleChange}
              className="border p-2 rounded w-full mb-3"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Disability?</label>
            <select
              name="disability"
              value={profile.disability ? "true" : "false"}
              onChange={(e) => setProfile({ ...profile, disability: e.target.value === 'true' })}
              className="border p-2 rounded w-full mb-3"
            >
              <option value="false">No</option>
              <option value="true">Yes</option>
            </select>
          </div>

        </div>

        <motion.button
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.02 }}
          className="bg-indigo-600 text-white px-6 py-2 rounded-lg mt-4"
          onClick={handleSave}
        >
          Save Profile
        </motion.button>
      </div>
    </div>
  );
}
