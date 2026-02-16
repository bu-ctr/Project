import { Link } from "react-router-dom";

export default function CompetitionCard({ competition }) {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-xl hover:shadow-teal-100 hover:border-teal-100 transition duration-300 flex flex-col h-full group">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <span className="inline-block px-3 py-1 bg-teal-50 text-teal-700 text-xs font-semibold rounded-full mb-2">
                        Competition
                    </span>
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-teal-600 transition">
                        {competition.title}
                    </h3>
                </div>
                <div className="bg-purple-50 text-purple-700 px-3 py-1 rounded-lg text-sm font-bold">
                    {competition.event_date || 'TBA'}
                </div>
            </div>

            <p className="text-sm text-gray-500 font-medium mb-4">{competition.organizer}</p>

            <p className="text-gray-600 text-sm line-clamp-3 mb-6 flex-1 text-justify">
                {competition.description}
            </p>

            <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-50">
                <span className="text-xs text-gray-400 font-medium">
                    Prize: {competition.prize_money ? `₹${competition.prize_money}` : 'Free Entry'}
                </span>
                <button className="text-teal-600 font-semibold text-sm hover:underline flex items-center gap-1">
                    Register Now &rarr;
                </button>
            </div>
        </div>
    );
}
