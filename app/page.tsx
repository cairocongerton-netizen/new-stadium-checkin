import Link from 'next/link';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <h1 className="text-4xl md:text-5xl font-normal mb-4">
          New Stadium Check-In
        </h1>
        <p className="text-gray-600 mb-12">
          Welcome! Please register or sign in to check in.
        </p>

        <div className="space-y-4">
          <Link
            href="/register"
            className="block w-full bg-black text-white px-6 py-4 hover:bg-gray-800 transition-colors text-center"
          >
            Register New Account
          </Link>

          <Link
            href="/login"
            className="block w-full border-2 border-black text-black px-6 py-4 hover:bg-gray-100 transition-colors text-center"
          >
            Sign In
          </Link>
        </div>

        <p className="text-sm text-gray-500 mt-8">
          New users: Create an account with your email and a 4-digit PIN
        </p>
      </div>
    </div>
  );
}
