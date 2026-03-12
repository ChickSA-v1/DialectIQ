import DashboardShell from "@/components/DashboardShell";

export default function Home() {
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 text-white font-bold text-lg w-10 h-10 rounded-lg flex items-center justify-center">
            D
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">DialectIQ</h1>
            <p className="text-sm text-gray-500">
              Saudi dialect-aware sentiment analysis
            </p>
          </div>
        </div>
      </div>

      <DashboardShell />
    </main>
  );
}
