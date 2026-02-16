import { useEffect, useState } from "react";
import api from "../services/api";
import InternshipCard from "../components/InternshipCard";

export default function Internships() {
    const [internships, setInternships] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api
            .get("/internships")
            .then((res) => {
                setInternships(res.data.internships || []);
            })
            .catch(() => {
                setInternships([]);
            })
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return <p className="text-center mt-10">Loading internships...</p>;
    }

    return (
        <div className="max-w-7xl mx-auto px-6 py-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Internships & Opportunities
            </h2>
            <p className="text-gray-600 mb-8">
                Find internships and job opportunities relevant to your field.
            </p>

            {internships.length === 0 ? (
                <p className="text-gray-500">
                    No internships available at the moment.
                </p>
            ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {internships.map((i) => (
                        <InternshipCard key={i.id} internship={i} />
                    ))}
                </div>
            )}
        </div>
    );
}
