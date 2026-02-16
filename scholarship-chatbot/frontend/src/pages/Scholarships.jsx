import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom"; // Added useLocation
import api from "../services/api";
import ScholarshipCard from "../components/ScholarshipCard";

export default function Scholarships() {
  const [scholarships, setScholarships] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation(); // Hook to get state

  useEffect(() => {
    const guestProfile = location.state?.guestProfile;

    if (guestProfile) {
      // Guest mode: fetch matches based on passed profile
      api.post("/match", { profile: guestProfile })
        .then((res) => {
          // POST /match returns { matches: [ { scholarship: {...}, score: ... } ] }
          // We map it back to just scholarship objects
          const list = (res.data.matches || []).map(m => m.scholarship);
          setScholarships(list);
        })
        .catch(err => {
          console.error(err);
          setScholarships([]);
        })
        .finally(() => setLoading(false));
    } else {
      // Normal mode: fetch all
      api.get("/scholarships")
        .then((res) => {
          setScholarships(res.data.scholarships || []);
        })
        .catch(() => {
          setScholarships([]);
        })
        .finally(() => setLoading(false));
    }
  }, [location.state]);

  if (loading) {
    return <p className="text-center mt-10">Loading scholarships...</p>;
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <h2 className="text-3xl font-bold text-gray-900 mb-2">
        Available Scholarships
      </h2>
      <p className="text-gray-600 mb-8">
        Explore scholarships you can apply for based on eligibility criteria.
      </p>

      {scholarships.length === 0 ? (
        <p className="text-gray-500">
          No scholarships available at the moment.
        </p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {scholarships.map((s) => (
            <ScholarshipCard key={s.id} scholarship={s} />
          ))}
        </div>
      )}
    </div>
  );
}
