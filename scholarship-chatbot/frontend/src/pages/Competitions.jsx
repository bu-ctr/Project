import { useEffect, useState } from "react";
import api from "../services/api";
import CompetitionCard from "../components/CompetitionCard";

export default function Competitions() {
    const [competitions, setCompetitions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api
            .get("/competitions")
            .then((res) => {
                setCompetitions(res.data.competitions || []);
            })
            .catch(() => {
                setCompetitions([]);
            })
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return <p className="text-center mt-10">Loading competitions...</p>;
    }

    return (
        <div className="max-w-7xl mx-auto px-6 py-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Featured Competitions
            </h2>
            <p className="text-gray-600 mb-8">
                Participate in competitions to showcase your skills and win exciting prizes.
            </p>

            {competitions.length === 0 ? (
                <p className="text-gray-500">
                    No competitions available at the moment.
                </p>
            ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {competitions.map((c) => (
                        <CompetitionCard key={c.id} competition={c} />
                    ))}
                </div>
            )}
        </div>
    );
}
