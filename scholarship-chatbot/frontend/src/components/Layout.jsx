export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <nav className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between">
          <h1 className="text-xl font-bold text-primary">
            ScholarConnect
          </h1>
          <div className="space-x-6 text-sm font-medium">
            <a href="/" className="hover:text-primary">Home</a>
            <a href="/scholarships" className="hover:text-primary">Scholarships</a>
            {localStorage.getItem("token") && (
              <a href="/profile" className="hover:text-primary">Profile</a>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-10">
        {children}
      </main>
    </div>
  );
}
