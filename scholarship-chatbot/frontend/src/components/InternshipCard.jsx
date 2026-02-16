import { Link } from "react-router-dom";

export default function InternshipCard({ internship }) {
    return (
        <div className="card-premium p-8 flex flex-col h-full group relative overflow-hidden">
            {/* Background Gradient Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 opacity-0 group-hover:opacity-5 transition-opacity duration-500"></div>

            <div className="flex justify-between items-start mb-5 relative z-10">
                <div>
                    <span className="inline-block px-4 py-1.5 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 text-xs font-bold rounded-full mb-3 shadow-sm">
                        💼 Internship
                    </span>
                    <h3 className="text-2xl font-bold text-gray-900 group-hover:text-purple-600 transition-colors duration-300">
                        {internship.title}
                    </h3>
                </div>
                <div className="bg-gradient-to-r from-gray-100 to-gray-50 text-gray-700 px-4 py-2 rounded-xl text-sm font-bold shadow-sm">
                    📍 {internship.location || 'Remote'}
                </div>
            </div>

            <p className="text-base text-gray-600 font-semibold mb-4 relative z-10">{internship.company}</p>

            <p className="text-gray-600 text-sm line-clamp-3 mb-6 flex-1 leading-relaxed relative z-10">
                {internship.description}
            </p>

            <div className="mt-auto pt-6 border-t border-gray-100 relative z-10">
                <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-gray-500 font-medium">
                        💰 ₹{internship.stipend?.toLocaleString()}/month
                    </span>
                </div>
                <button className="btn-accent w-full group/btn">
                    Apply Now
                    <span className="inline-block ml-2 group-hover/btn:translate-x-1 transition-transform">→</span>
                </button>
            </div>
        </div>
    );
}
