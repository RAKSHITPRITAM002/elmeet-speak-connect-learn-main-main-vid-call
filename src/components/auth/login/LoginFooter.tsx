
import { Link } from "react-router-dom";
import { ExternalLink } from "lucide-react";

export function LoginFooter() {
  return (
    <div className="mt-6 text-center">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">
            Don't have an account?
          </span>
        </div>
      </div>
      <Link
        to="/register"
        className="mt-4 inline-flex items-center text-sm font-medium text-purple-600 hover:text-purple-800 hover:underline"
      >
        Create an account <ExternalLink className="ml-1 h-3.5 w-3.5" />
      </Link>
    </div>
  );
}
