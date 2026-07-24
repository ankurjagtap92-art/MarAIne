"use client";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="min-h-screen bg-[#060b1a] flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-[#0d2137]/80 border border-red-500/30 rounded-xl p-6">
        <h2 className="text-2xl font-bold text-red-400 mb-4">⚠️ Something Went Wrong</h2>
        <pre className="text-sm text-red-300/80 whitespace-pre-wrap bg-black/30 p-4 rounded-lg overflow-auto max-h-96">
          {error.message || "No error message"}
          {"\n\n"}
          {error.stack || "No stack trace"}
        </pre>
        <button
          onClick={reset}
          className="mt-6 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-400 text-[#04101f] font-semibold rounded-lg hover:shadow-lg hover:shadow-cyan-500/30 transition-all"
        >
          Try again
        </button>
      </div>
    </div>
  );
}