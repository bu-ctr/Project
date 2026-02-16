import { useState, useEffect } from "react";
import api from "../services/api";

// Grade conversion utilities
const GRADE_SCALES = {
    "10-point": {
        "O": 10, "A+": 9, "A": 8, "B+": 7, "B": 6, "C": 5, "P": 4, "F": 0
    },
    "4-point": {
        "A": 4.0, "A-": 3.7, "B+": 3.3, "B": 3.0, "B-": 2.7,
        "C+": 2.3, "C": 2.0, "C-": 1.7, "D": 1.0, "F": 0
    }
};

export default function GPACalculator() {
    const [activeTab, setActiveTab] = useState("sgpa"); // sgpa, cgpa, history
    const [gradingScale, setGradingScale] = useState("10-point");

    // SGPA state
    const [courses, setCourses] = useState([
        { name: "", credits: "", grade: "", gradePoints: 0 }
    ]);
    const [sgpa, setSgpa] = useState(null);
    const [semesterName, setSemesterName] = useState("");

    // CGPA state
    const [semesters, setSemesters] = useState([
        { name: "Semester 1", sgpa: "", credits: "" }
    ]);
    const [cgpa, setCgpa] = useState(null);

    // History state
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);

    // Fetch calculation history
    useEffect(() => {
        if (activeTab === "history") {
            fetchHistory();
        }
    }, [activeTab]);

    const fetchHistory = async () => {
        try {
            setLoading(true);
            const res = await api.get('/gpa/calculations');
            setHistory(res.data.calculations || []);
        } catch (error) {
            console.error('Error fetching history:', error);
        } finally {
            setLoading(false);
        }
    };

    // Add course row
    const addCourse = () => {
        setCourses([...courses, { name: "", credits: "", grade: "", gradePoints: 0 }]);
    };

    // Remove course row
    const removeCourse = (index) => {
        const updated = courses.filter((_, i) => i !== index);
        setCourses(updated.length > 0 ? updated : [{ name: "", credits: "", grade: "", gradePoints: 0 }]);
    };

    // Update course
    const updateCourse = (index, field, value) => {
        const updated = [...courses];
        updated[index][field] = value;

        // Auto-calculate grade points
        if (field === "grade" && value) {
            updated[index].gradePoints = GRADE_SCALES[gradingScale][value] || 0;
        }

        setCourses(updated);
        calculateSGPA(updated);
    };

    // Calculate SGPA
    const calculateSGPA = (coursesData = courses) => {
        let totalCredits = 0;
        let totalGradePoints = 0;

        coursesData.forEach(course => {
            const credits = parseFloat(course.credits) || 0;
            const gradePoints = course.gradePoints || 0;
            totalCredits += credits;
            totalGradePoints += credits * gradePoints;
        });

        if (totalCredits > 0) {
            const calculatedSgpa = (totalGradePoints / totalCredits).toFixed(2);
            setSgpa(calculatedSgpa);
            return { totalCredits, totalGradePoints, gpa: calculatedSgpa };
        }

        setSgpa(null);
        return null;
    };

    // Save SGPA calculation
    const saveSGPA = async () => {
        const result = calculateSGPA();
        if (!result) {
            alert("Please enter valid course data");
            return;
        }

        try {
            await api.post('/gpa/calculations', {
                calculationType: 'sgpa',
                semesterName: semesterName || `Semester ${new Date().toLocaleDateString()}`,
                gradingScale,
                courses,
                totalCredits: result.totalCredits,
                totalGradePoints: result.totalGradePoints,
                gpa: result.gpa
            });

            alert("SGPA saved successfully!");
            setSemesterName("");
        } catch (error) {
            console.error('Error saving SGPA:', error);
            alert("Failed to save SGPA");
        }
    };

    // Add semester
    const addSemester = () => {
        setSemesters([...semesters, { name: `Semester ${semesters.length + 1}`, sgpa: "", credits: "" }]);
    };

    // Remove semester
    const removeSemester = (index) => {
        const updated = semesters.filter((_, i) => i !== index);
        setSemesters(updated.length > 0 ? updated : [{ name: "Semester 1", sgpa: "", credits: "" }]);
    };

    // Update semester
    const updateSemester = (index, field, value) => {
        const updated = [...semesters];
        updated[index][field] = value;
        setSemesters(updated);
        calculateCGPA(updated);
    };

    // Calculate CGPA
    const calculateCGPA = (semestersData = semesters) => {
        let totalCredits = 0;
        let totalGradePoints = 0;

        semestersData.forEach(sem => {
            const credits = parseFloat(sem.credits) || 0;
            const semSgpa = parseFloat(sem.sgpa) || 0;
            totalCredits += credits;
            totalGradePoints += credits * semSgpa;
        });

        if (totalCredits > 0) {
            const calculatedCgpa = (totalGradePoints / totalCredits).toFixed(2);
            setCgpa(calculatedCgpa);
            return { totalCredits, totalGradePoints, gpa: calculatedCgpa };
        }

        setCgpa(null);
        return null;
    };

    // Save CGPA calculation
    const saveCGPA = async () => {
        const result = calculateCGPA();
        if (!result) {
            alert("Please enter valid semester data");
            return;
        }

        try {
            await api.post('/gpa/calculations', {
                calculationType: 'cgpa',
                semesterName: `CGPA (${semesters.length} semesters)`,
                gradingScale,
                courses: semesters,
                totalCredits: result.totalCredits,
                totalGradePoints: result.totalGradePoints,
                gpa: result.gpa
            });

            alert("CGPA saved successfully!");
        } catch (error) {
            console.error('Error saving CGPA:', error);
            alert("Failed to save CGPA");
        }
    };

    // Delete calculation
    const deleteCalculation = async (id) => {
        if (!confirm("Delete this calculation?")) return;

        try {
            await api.delete(`/gpa/calculations/${id}`);
            fetchHistory();
        } catch (error) {
            console.error('Error deleting calculation:', error);
            alert("Failed to delete calculation");
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30 py-12">
            <div className="max-w-6xl mx-auto px-6">

                {/* Header */}
                <div className="text-center mb-10 animate-fade-in-up">
                    <div className="inline-flex items-center gap-2 px-5 py-2 mb-6 rounded-full bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 text-blue-700 font-semibold text-sm shadow-lg">
                        <span className="text-2xl">📊</span>
                        GPA Calculator
                    </div>

                    <h1 className="text-5xl font-bold mb-4">
                        Calculate Your <span className="text-gradient">CGPA & SGPA</span>
                    </h1>

                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Easily calculate your Semester Grade Point Average (SGPA) and Cumulative Grade Point Average (CGPA) with support for multiple grading scales.
                    </p>
                </div>

                {/* Tabs */}
                <div className="flex justify-center gap-4 mb-8">
                    <button
                        onClick={() => setActiveTab("sgpa")}
                        className={`px-6 py-3 rounded-lg font-semibold transition-all ${activeTab === "sgpa"
                                ? "bg-indigo-600 text-white shadow-lg"
                                : "bg-white text-gray-700 hover:bg-gray-50"
                            }`}
                    >
                        📘 SGPA Calculator
                    </button>
                    <button
                        onClick={() => setActiveTab("cgpa")}
                        className={`px-6 py-3 rounded-lg font-semibold transition-all ${activeTab === "cgpa"
                                ? "bg-indigo-600 text-white shadow-lg"
                                : "bg-white text-gray-700 hover:bg-gray-50"
                            }`}
                    >
                        📚 CGPA Calculator
                    </button>
                    <button
                        onClick={() => setActiveTab("history")}
                        className={`px-6 py-3 rounded-lg font-semibold transition-all ${activeTab === "history"
                                ? "bg-indigo-600 text-white shadow-lg"
                                : "bg-white text-gray-700 hover:bg-gray-50"
                            }`}
                    >
                        📜 History
                    </button>
                </div>

                {/* SGPA Tab */}
                {activeTab === "sgpa" && (
                    <div className="bg-white rounded-2xl p-8 shadow-lg">
                        <h2 className="text-2xl font-bold mb-6">SGPA Calculator</h2>

                        {/* Grading Scale Selector */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Grading Scale</label>
                            <select
                                value={gradingScale}
                                onChange={(e) => setGradingScale(e.target.value)}
                                className="border border-gray-300 rounded-lg px-4 py-2 w-full max-w-xs"
                            >
                                <option value="10-point">10-Point Scale (O, A+, A, B+, etc.)</option>
                                <option value="4-point">4-Point Scale (A, A-, B+, etc.)</option>
                            </select>
                        </div>

                        {/* Semester Name */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Semester Name (Optional)</label>
                            <input
                                type="text"
                                value={semesterName}
                                onChange={(e) => setSemesterName(e.target.value)}
                                placeholder="e.g., Semester 5, Fall 2023"
                                className="border border-gray-300 rounded-lg px-4 py-2 w-full max-w-md"
                            />
                        </div>

                        {/* Courses Table */}
                        <div className="overflow-x-auto mb-6">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Course Name</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Credits</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Grade</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Grade Points</th>
                                        <th className="px-4 py-3"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {courses.map((course, index) => (
                                        <tr key={index} className="border-b">
                                            <td className="px-4 py-3">
                                                <input
                                                    type="text"
                                                    value={course.name}
                                                    onChange={(e) => updateCourse(index, "name", e.target.value)}
                                                    placeholder="Course name"
                                                    className="border border-gray-300 rounded px-3 py-2 w-full"
                                                />
                                            </td>
                                            <td className="px-4 py-3">
                                                <input
                                                    type="number"
                                                    value={course.credits}
                                                    onChange={(e) => updateCourse(index, "credits", e.target.value)}
                                                    placeholder="3"
                                                    className="border border-gray-300 rounded px-3 py-2 w-20"
                                                    min="0"
                                                    step="0.5"
                                                />
                                            </td>
                                            <td className="px-4 py-3">
                                                <select
                                                    value={course.grade}
                                                    onChange={(e) => updateCourse(index, "grade", e.target.value)}
                                                    className="border border-gray-300 rounded px-3 py-2 w-24"
                                                >
                                                    <option value="">Select</option>
                                                    {Object.keys(GRADE_SCALES[gradingScale]).map(grade => (
                                                        <option key={grade} value={grade}>{grade}</option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td className="px-4 py-3 font-semibold text-indigo-600">
                                                {course.gradePoints.toFixed(1)}
                                            </td>
                                            <td className="px-4 py-3">
                                                <button
                                                    onClick={() => removeCourse(index)}
                                                    className="text-red-600 hover:text-red-700 font-semibold"
                                                >
                                                    ×
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <button
                            onClick={addCourse}
                            className="mb-6 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-semibold transition"
                        >
                            + Add Course
                        </button>

                        {/* Result */}
                        {sgpa !== null && (
                            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-6 mb-6">
                                <div className="text-center">
                                    <div className="text-gray-600 text-sm font-medium mb-2">Your SGPA</div>
                                    <div className="text-5xl font-bold text-gradient mb-2">{sgpa}</div>
                                    <div className="text-gray-600 text-sm">
                                        out of {gradingScale === "10-point" ? "10.0" : "4.0"}
                                    </div>
                                </div>
                            </div>
                        )}

                        <button
                            onClick={saveSGPA}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg transition"
                        >
                            💾 Save SGPA Calculation
                        </button>
                    </div>
                )}

                {/* CGPA Tab */}
                {activeTab === "cgpa" && (
                    <div className="bg-white rounded-2xl p-8 shadow-lg">
                        <h2 className="text-2xl font-bold mb-6">CGPA Calculator</h2>

                        {/* Grading Scale Selector */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Grading Scale</label>
                            <select
                                value={gradingScale}
                                onChange={(e) => setGradingScale(e.target.value)}
                                className="border border-gray-300 rounded-lg px-4 py-2 w-full max-w-xs"
                            >
                                <option value="10-point">10-Point Scale</option>
                                <option value="4-point">4-Point Scale</option>
                            </select>
                        </div>

                        {/* Semesters Table */}
                        <div className="overflow-x-auto mb-6">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Semester</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">SGPA</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Credits</th>
                                        <th className="px-4 py-3"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {semesters.map((sem, index) => (
                                        <tr key={index} className="border-b">
                                            <td className="px-4 py-3">
                                                <input
                                                    type="text"
                                                    value={sem.name}
                                                    onChange={(e) => updateSemester(index, "name", e.target.value)}
                                                    className="border border-gray-300 rounded px-3 py-2 w-full"
                                                />
                                            </td>
                                            <td className="px-4 py-3">
                                                <input
                                                    type="number"
                                                    value={sem.sgpa}
                                                    onChange={(e) => updateSemester(index, "sgpa", e.target.value)}
                                                    placeholder="8.5"
                                                    className="border border-gray-300 rounded px-3 py-2 w-24"
                                                    min="0"
                                                    max={gradingScale === "10-point" ? "10" : "4"}
                                                    step="0.01"
                                                />
                                            </td>
                                            <td className="px-4 py-3">
                                                <input
                                                    type="number"
                                                    value={sem.credits}
                                                    onChange={(e) => updateSemester(index, "credits", e.target.value)}
                                                    placeholder="20"
                                                    className="border border-gray-300 rounded px-3 py-2 w-24"
                                                    min="0"
                                                />
                                            </td>
                                            <td className="px-4 py-3">
                                                <button
                                                    onClick={() => removeSemester(index)}
                                                    className="text-red-600 hover:text-red-700 font-semibold"
                                                >
                                                    ×
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <button
                            onClick={addSemester}
                            className="mb-6 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-semibold transition"
                        >
                            + Add Semester
                        </button>

                        {/* Result */}
                        {cgpa !== null && (
                            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-6 mb-6">
                                <div className="text-center">
                                    <div className="text-gray-600 text-sm font-medium mb-2">Your CGPA</div>
                                    <div className="text-5xl font-bold text-gradient mb-2">{cgpa}</div>
                                    <div className="text-gray-600 text-sm">
                                        out of {gradingScale === "10-point" ? "10.0" : "4.0"}
                                    </div>
                                </div>
                            </div>
                        )}

                        <button
                            onClick={saveCGPA}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg transition"
                        >
                            💾 Save CGPA Calculation
                        </button>
                    </div>
                )}

                {/* History Tab */}
                {activeTab === "history" && (
                    <div className="bg-white rounded-2xl p-8 shadow-lg">
                        <h2 className="text-2xl font-bold mb-6">Calculation History</h2>

                        {loading ? (
                            <div className="text-center py-12">
                                <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                <p className="text-gray-600">Loading history...</p>
                            </div>
                        ) : history.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="text-6xl mb-4">📊</div>
                                <p className="text-gray-600">No calculations saved yet</p>
                                <p className="text-gray-500 text-sm mt-2">Calculate and save your first GPA!</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {history.map((calc) => (
                                    <div key={calc.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <div className="flex items-center gap-3 mb-2">
                                                    <span className="text-2xl">
                                                        {calc.calculation_type === 'sgpa' ? '📘' : '📚'}
                                                    </span>
                                                    <h3 className="text-lg font-bold">{calc.semester_name}</h3>
                                                    <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs font-semibold rounded">
                                                        {calc.calculation_type.toUpperCase()}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-500">
                                                    {new Date(calc.created_at).toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    })}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => deleteCalculation(calc.id)}
                                                className="text-red-600 hover:text-red-700 font-semibold"
                                            >
                                                Delete
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-3 gap-4 bg-gray-50 rounded-lg p-4">
                                            <div>
                                                <div className="text-sm text-gray-600 mb-1">GPA</div>
                                                <div className="text-2xl font-bold text-gradient">{calc.gpa}</div>
                                            </div>
                                            <div>
                                                <div className="text-sm text-gray-600 mb-1">Total Credits</div>
                                                <div className="text-2xl font-bold text-gray-900">{calc.total_credits}</div>
                                            </div>
                                            <div>
                                                <div className="text-sm text-gray-600 mb-1">Grading Scale</div>
                                                <div className="text-sm font-semibold text-gray-700">{calc.grading_scale}</div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Grade Reference Card */}
                <div className="mt-8 bg-white rounded-2xl p-8 shadow-lg">
                    <h3 className="text-xl font-bold mb-4">📋 Grade Reference</h3>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <h4 className="font-semibold mb-3 text-indigo-600">10-Point Scale</h4>
                            <div className="space-y-2 text-sm">
                                {Object.entries(GRADE_SCALES["10-point"]).map(([grade, points]) => (
                                    <div key={grade} className="flex justify-between">
                                        <span className="font-medium">{grade}</span>
                                        <span className="text-gray-600">{points} points</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-3 text-indigo-600">4-Point Scale</h4>
                            <div className="space-y-2 text-sm">
                                {Object.entries(GRADE_SCALES["4-point"]).map(([grade, points]) => (
                                    <div key={grade} className="flex justify-between">
                                        <span className="font-medium">{grade}</span>
                                        <span className="text-gray-600">{points} points</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
