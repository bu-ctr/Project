import Chatbot from "../components/Chatbot";
import { isLoggedIn } from "../utils/auth";
import { Link } from "react-router-dom";

export default function ChatbotPage() {
    const loggedIn = isLoggedIn();

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50/20 to-violet-50/20 py-12">
            <div className="max-w-5xl mx-auto px-6">

                {/* Header Section */}
                <div className="text-center mb-10 animate-fade-in-up">
                    <div className="inline-flex items-center gap-2 px-5 py-2 mb-6 rounded-full bg-gradient-to-r from-indigo-50 to-violet-50 border border-indigo-200 text-indigo-700 font-semibold text-sm shadow-lg">
                        <span className="text-2xl">🤖</span>
                        AI-Powered Assistant
                    </div>

                    <h1 className="text-5xl font-bold mb-4">
                        Chat with Your <span className="text-gradient">Personal AI</span>
                    </h1>

                    <p className="text-xl text-gray-600 mb-6 max-w-2xl mx-auto leading-relaxed">
                        Our AI assistant helps you build your profile and finds the perfect scholarships, internships, and courses tailored just for you.
                    </p>

                    {!loggedIn && (
                        <div className="bg-white/80 backdrop-blur-sm border border-indigo-100 rounded-2xl p-6 max-w-2xl mx-auto mb-8 shadow-lg">
                            <p className="text-gray-700 mb-4">
                                💡 <strong>Pro Tip:</strong> Sign up to save your progress and get personalized recommendations!
                            </p>
                            <div className="flex gap-3 justify-center">
                                <Link to="/signup" className="btn-primary">
                                    Create Free Account
                                </Link>
                                <Link to="/login" className="btn-outline">
                                    Login
                                </Link>
                            </div>
                        </div>
                    )}
                </div>

                {/* Chatbot Component */}
                <div className="animate-fade-in-up">
                    <Chatbot />
                </div>

                {/* Benefits Below */}
                <div className="mt-12 grid md:grid-cols-3 gap-6 animate-fade-in-up">
                    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm text-center hover-lift">
                        <div className="text-4xl mb-3">⚡</div>
                        <h3 className="font-bold text-gray-900 mb-2">Fast & Easy</h3>
                        <p className="text-gray-600 text-sm">Get matched in minutes, not hours</p>
                    </div>
                    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm text-center hover-lift">
                        <div className="text-4xl mb-3">🎯</div>
                        <h3 className="font-bold text-gray-900 mb-2">Highly Accurate</h3>
                        <p className="text-gray-600 text-sm">AI learns your preferences as you chat</p>
                    </div>
                    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm text-center hover-lift">
                        <div className="text-4xl mb-3">🔒</div>
                        <h3 className="font-bold text-gray-900 mb-2">100% Secure</h3>
                        <p className="text-gray-600 text-sm">Your data is private and protected</p>
                    </div>
                </div>

            </div>
        </div>
    );
}
