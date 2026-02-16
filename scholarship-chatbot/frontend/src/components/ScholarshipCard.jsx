import { Link } from "react-router-dom";

export default function ScholarshipCard({ scholarship }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-xl hover:shadow-indigo-100 hover:border-indigo-100 transition duration-300 flex flex-col h-full group">
      <div className="flex justify-between items-start mb-4">
        <div>
          <span className="inline-block px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-full mb-2">
            Scholarship
          </span>
          <h3 className="text-xl font-bold text-gray-900 group-hover:text-indigo-600 transition">
            {scholarship.title}
          </h3>
        </div>
        <div className="bg-green-50 text-green-700 px-3 py-1 rounded-lg text-sm font-bold">
          ₹{scholarship.amount?.toLocaleString()}
        </div>
      </div>

      <p className="text-sm text-gray-500 font-medium mb-4">{scholarship.provider_name}</p>

      <p className="text-gray-600 text-sm line-clamp-3 mb-6 flex-1 text-justify">
        {scholarship.description}
      </p>

      <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-50">
        <span className="text-xs text-gray-400 font-medium">
          Deadline: {new Date(scholarship.deadline).toLocaleDateString()}
        </span>
        <Link
          to={`/scholarships/${scholarship.id}`}
          className="text-indigo-600 font-semibold text-sm hover:underline flex items-center gap-1"
        >
          View Details &rarr;
        </Link>
      </div>
    </div>
  );
}
