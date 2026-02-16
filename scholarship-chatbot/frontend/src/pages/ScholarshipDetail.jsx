import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";

export default function ScholarshipDetail() {
  const { id } = useParams();
  const [s, setS] = useState(null);

  useEffect(() => {
    api.get(`/scholarships/${id}`).then(res => setS(res.data.scholarship));
  }, [id]);

  if (!s) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <div className="bg-white rounded-xl shadow border p-8">
        <h1 className="text-3xl font-bold text-gray-900">
          {s.title}
        </h1>

        <p className="text-gray-500 mt-2">
          Provided by {s.provider}
        </p>

        <div className="mt-6 space-y-3 text-gray-700">
          <p><strong>Amount:</strong> {s.amount}</p>
          <p><strong>Deadline:</strong> {s.deadline}</p>
        </div>

        <div className="mt-6">
          <h3 className="font-semibold text-lg mb-2">
            Description
          </h3>
          <p className="text-gray-700">{s.description}</p>
        </div>

        <a
          href={s.application_url}
          target="_blank"
          rel="noreferrer"
          className="inline-block mt-6 bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition"
        >
          Apply Now
        </a>
      </div>
    </div>
  );
}
