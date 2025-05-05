
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ReactNode } from "react";

interface AuthCardProps {
  title: ReactNode;
  description: ReactNode;
  children: ReactNode;
  error?: string | null;
}

export function AuthCard({ title, description, children, error }: AuthCardProps) {
  return (
    <Card className="w-full max-w-md mx-auto shadow-xl bg-white/90 backdrop-blur-sm border border-white/20">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-3xl font-bold tracking-tight">
          {title}
        </CardTitle>
        <CardDescription>
          {description}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {error && (
          <div className="mb-4 p-3 rounded-md bg-gradient-to-r from-red-50 to-red-100 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}
        {children}
      </CardContent>
    </Card>
  );
}
