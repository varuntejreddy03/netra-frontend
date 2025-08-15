"use client";

export default function Page() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 to-yellow-100 p-4">
      <div
        className="bg-white rounded-2xl shadow-xl p-8 max-w-lg text-center border border-yellow-300 animate-fadeIn"
        style={{
          animation: "fadeIn 1s ease-in-out",
        }}
      >
        <div className="flex justify-center mb-4 animate-bounce">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 text-yellow-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.662 1.732-3L13.732 4c-.77-1.338-2.694-1.338-3.464 0L3.34 16c-.77 1.338.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-yellow-800 mb-3">
          Service Temporarily Unavailable
        </h1>
        <p className="text-gray-700 leading-relaxed">
          This service is shutting down due to changes in our college's server
          infrastructure.
        </p>
        <p className="mt-3 text-gray-700 leading-relaxed">
          We sincerely appreciate everyone who used this netrapro.
        </p>
      </div>
    </main>
  );
}
