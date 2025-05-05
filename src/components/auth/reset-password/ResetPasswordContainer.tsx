
import { AuthCard } from "@/components/auth/AuthCard";

interface ResetPasswordContainerProps {
  title: string;
  children: React.ReactNode;
}

export const ResetPasswordContainer = ({ title, children }: ResetPasswordContainerProps) => {
  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">
        {title}
      </h1>
      {children}
    </div>
  );
};
