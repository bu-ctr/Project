import { isLoggedIn } from "../utils/auth";
import { Link } from "react-router-dom";
import Chatbot from "../components/Chatbot";
import { useState, useEffect } from "react";
import api from "../services/api";

// Personalized Dashboard Component
function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/dashboard/stats');
        setStats(response.data);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50/30 to-violet-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading your personalized dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50/30 to-violet-50/30">
      <div className="max-w-7xl mx-auto px-6 py-12">

        {/* Enhanced Header */}
        <div className="mb-12 text-center md:text-left animate-fade-in-up">
          <h1 className="text-5xl font-bold mb-3">
            <span className="text-gradient">Welcome back</span>, Student
          </h1>
          <p className="text-gray-600 text-xl">Your personalized dashboard is ready — let's achieve your goals today! 🚀</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-2 grid md:grid-cols-3 gap-6">
            <DashboardCard
              to="/scholarships"
              icon="🎓"
              title="Scholarships"
              desc="Discover financial aid tailored to your profile."
              gradient="from-blue-500 to-cyan-500"
              delay="0"
            />
            <DashboardCard
              to="/internships"
              icon="💼"
              title="Internships"
              desc="Explore career-building opportunities."
              gradient="from-purple-500 to-pink-500"
              delay="100"
            />
            <DashboardCard
              to="/competitions"
              icon="🏆"
              title="Competitions"
              desc="Test your skills and win exciting prizes."
              gradient="from-teal-500 to-emerald-500"
              delay="200"
            />
            <DashboardCard
              to="/gpa-calculator"
              icon="📊"
              title="GPA Calculator"
              desc="Calculate your CGPA and SGPA easily."
              gradient="from-orange-500 to-red-500"
              delay="300"
            />
          </div>

          {/* Enhanced AI Chatbot CTA */}
          <div className="card-glass p-8 relative overflow-hidden group animate-fade-in-up hover-lift">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-indigo-400 to-violet-600 rounded-full opacity-20 blur-3xl group-hover:scale-150 transition-all duration-700"></div>

            <div className="relative z-10">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-2xl flex items-center justify-center text-3xl mb-4 shadow-lg shadow-indigo-300 animate-float">
                🤖
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">AI Profile Assistant</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Get instant, personalized recommendations. Let our AI optimize your profile in minutes.
              </p>
              <Link to="/chatbot" className="btn-primary w-full text-center inline-block">
                Launch AI Chat 💬
              </Link>
            </div>
          </div>
        </div>

        {/* Personalized Stats */}
        <div className="mt-12 grid md:grid-cols-3 gap-6 animate-fade-in-up">
          <StatCard
            icon="✨"
            value={stats?.matchesFound || 0}
            label="Matches Found"
          />
          <StatCard
            icon="📈"
            value={`${stats?.profileCompletion || 0}%`}
            label="Profile Completion"
            highlight={stats?.profileCompletion < 100}
          />
          <StatCard
            icon="🎯"
            value={stats?.newMatchesToday || 0}
            label="New Today"
          />
        </div>

        {/* Next Best Action */}
        {stats?.nextBestAction && (
          <div className="mt-8 animate-fade-in-up">
            <div className="bg-white rounded-2xl p-8 border border-indigo-100 shadow-lg hover-lift">
              <div className="flex items-start gap-6">
                <div className="text-6xl">{stats.nextBestAction.icon}</div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{stats.nextBestAction.title}</h3>
                  <p className="text-gray-600 mb-4 leading-relaxed">{stats.nextBestAction.description}</p>
                  <Link to={stats.nextBestAction.link} className="btn-primary inline-block">
                    {stats.nextBestAction.action} →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Top Recommendations */}
        {stats?.recommendations && stats.recommendations.length > 0 && (
          <div className="mt-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">📌 Top Matches For You</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {stats.recommendations.map((rec, idx) => (
                <div key={idx} className="card-premium p-6 animate-fade-in-up" style={{ animationDelay: `${idx * 100}ms` }}>
                  <div className="text-xs font-bold text-indigo-600 mb-2">RECOMMENDED</div>
                  <h4 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">{rec.title}</h4>
                  <p className="text-sm text-gray-600 line-clamp-3 mb-4">{rec.description}</p>
                  {rec.amount && (
                    <div className="text-lg font-bold text-gradient mb-3">₹{rec.amount?.toLocaleString()}</div>
                  )}
                  <Link to="/scholarships" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                    View Details →
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Missing Fields Alert */}
        {stats?.missingFields && stats.missingFields.length > 0 && (
          <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-2xl p-6 animate-fade-in-up">
            <div className="flex items-start gap-4">
              <div className="text-3xl">⚠️</div>
              <div>
                <h4 className="font-bold text-yellow-900 mb-2">Complete Your Profile</h4>
                <p className="text-yellow-800 text-sm mb-3">
                  Add these details to unlock more personalized matches:
                </p>
                <div className="flex flex-wrap gap-2">
                  {stats.missingFields.map((field, idx) => (
                    <span key={idx} className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full">
                      {field}
                    </span>
                  ))}
                </div>
                <Link to="/profile" className="inline-block mt-4 px-6 py-2 bg-yellow-600 text-white rounded-lg font-semibold hover:bg-yellow-700 transition">
                  Update Profile
                </Link>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default function Home() {
  const loggedIn = isLoggedIn();

  // DASHBOARD VIEW (Logged In)
  if (loggedIn) {
    return <Dashboard />;
  }

  // LANDING PAGE VIEW (Guest) - Enhanced
  return (
    <div className="bg-white overflow-hidden">
      {/* Hero Section - Enhanced */}
      <section className="relative pt-24 pb-32 overflow-hidden">
        {/* Animated Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full z-0 pointer-events-none">
          <div className="absolute top-20 left-10 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob"></div>
          <div className="absolute top-20 right-10 w-96 h-96 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-1/2 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob animation-delay-4000"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">

          <h1 className="text-6xl md:text-8xl font-extrabold tracking-tight text-gray-900 mb-8 leading-tight animate-fade-in-up">
            Your Future,<br />
            <span className="text-gradient animate-gradient">Supercharged</span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed animate-fade-in-up">
            EduNext is your <strong className="text-indigo-600">AI-powered companion</strong> connecting you with personalized <strong className="text-purple-600">scholarships</strong>, <strong className="text-pink-600">internships</strong>, and <strong className="text-teal-600">competitions</strong> — all in one place.
          </p>

          {/* Enhanced CTAs */}
          <div className="flex flex-col sm:flex-row justify-center gap-5 mb-16 animate-fade-in-up">
            <Link to="/signup" className="btn-primary group">
              Get Started Free
              <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform">→</span>
            </Link>
            <Link to="/chatbot" className="btn-secondary group">
              <span className="mr-2">🤖</span>
              Try AI Assistant
              <span className="inline-block ml-2 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
            </Link>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center gap-8 text-sm text-gray-500 animate-fade-in-up">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">No Credit Card Required</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">Free Forever</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">Setup in 2 Minutes</span>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid - Enhanced */}
      <section className="py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Everything You Need to <span className="text-gradient">Succeed</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Powerful features designed specifically for ambitious students like you
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            <FeatureCard
              icon="🎓"
              title="Smart Scholarships"
              desc="Our AI analyzes thousands of scholarships and matches you with ones you actually qualify for. Stop wasting time on applications you won't get."
              gradient="from-blue-500 to-cyan-500"
            />
            <FeatureCard
              icon="💼"
              title="Dream Internships"
              desc="Connect directly with top employers actively looking for talent like you. Skip the generic job boards and get noticed faster."
              gradient="from-purple-500 to-pink-500"
            />
            <FeatureCard
              icon="🏆"
              title="Exciting Competitions"
              desc="Showcase your talent in national and international competitions. Win prizes, gain recognition, and build your portfolio."
              gradient="from-teal-500 to-emerald-500"
            />
          </div>
        </div>
      </section>



      {/* Final CTA Section */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Ready to <span className="text-gradient">Transform</span> Your Future?
          </h2>
          <p className="text-xl text-gray-600 mb-10 leading-relaxed">
            Join students who are achieving their dreams with EduNext. Your perfect opportunity is waiting.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-5">
            <Link to="/signup" className="btn-primary group text-xl px-12 py-5">
              Start Your Journey Free
              <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </div>
          <p className="mt-6 text-gray-500 text-sm">No credit card required • Setup takes 2 minutes</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center gap-3 mb-4 md:mb-0">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg">
              En
            </div>
            <span className="text-2xl font-bold text-gradient">EduNext</span>
          </div>
          <p className="text-gray-600">
            © {new Date().getFullYear()} EduNext. Empowering students worldwide.
          </p>
        </div>
      </footer>
    </div>
  );
}

// Dashboard Card Component - Enhanced
function DashboardCard({ to, icon, title, desc, gradient, delay }) {
  return (
    <Link to={to} className="block group" style={{ animationDelay: `${delay}ms` }}>
      <div className="card-premium h-full p-8 relative overflow-hidden">
        <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${gradient} opacity-10 rounded-full -mr-8 -mt-8 group-hover:scale-150 transition-all duration-500`}></div>

        <div className={`w-16 h-16 bg-gradient-to-br ${gradient} rounded-2xl flex items-center justify-center text-4xl mb-6 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
          {icon}
        </div>

        <h3 className="text-2xl font-bold text-gray-900 mb-3">{title}</h3>
        <p className="text-gray-600 leading-relaxed mb-4">{desc}</p>

        <div className="flex items-center text-sm font-bold text-indigo-600 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
          Explore Now
          <span className="ml-2">→</span>
        </div>
      </div>
    </Link>
  );
}

// Stat Card Component
function StatCard({ icon, value, label, highlight }) {
  return (
    <div className={`bg-white rounded-2xl p-8 border shadow-sm text-center hover-lift ${highlight ? 'border-yellow-300 bg-yellow-50/50' : 'border-gray-100'}`}>
      <div className="text-4xl mb-3">{icon}</div>
      <div className="text-4xl font-bold text-gradient mb-2">{value}</div>
      <div className="text-gray-600 font-medium">{label}</div>
    </div>
  );
}

// Feature Card Component - Enhanced
function FeatureCard({ icon, title, desc, gradient }) {
  return (
    <div className="group bg-white p-10 rounded-3xl border-2 border-gray-100 hover:border-transparent hover:shadow-2xl hover:shadow-indigo-100 transition-all duration-500 hover-lift relative overflow-hidden">
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>

      <div className={`w-20 h-20 bg-gradient-to-br ${gradient} rounded-2xl flex items-center justify-center text-5xl mb-6 shadow-xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 relative z-10`}>
        {icon}
      </div>

      <h3 className="text-2xl font-bold text-gray-900 mb-4 relative z-10">{title}</h3>
      <p className="text-gray-600 leading-relaxed text-lg relative z-10">{desc}</p>
    </div>
  );
}
