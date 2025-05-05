
import { Link } from "react-router-dom";
import { ExternalLink } from "lucide-react";

export function RegisterFooter() {
  return (
    <>
      <p className="text-sm text-center text-gray-500">
        By creating an account, you agree to our{" "}
        <Link to="/terms" className="text-purple-600 hover:text-purple-800 hover:underline">
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link to="/privacy" className="text-purple-600 hover:text-purple-800 hover:underline">
          Privacy Policy
        </Link>
      </p>
      <div className="mt-6 text-center">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">
              Already have an account?
            </span>
          </div>
        </div>
        <Link
          to="/login"
          className="mt-4 inline-flex items-center text-sm font-medium text-purple-600 hover:text-purple-800 hover:underline"
        >
          Sign in <ExternalLink className="ml-1 h-3.5 w-3.5" />
        </Link>
      </div>
    </>
  );
}
