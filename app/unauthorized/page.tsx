import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-4xl font-bold text-red-600">403</h1>
      <p className="text-xl mt-4">
        You don't have permission to access this page
      </p>
      <Link
        href="/dashboard"
        className="mt-6 px-4 py-2 bg-primary text-white rounded"
      >
        Go to Dashboard
      </Link>
    </div>
  );
}
