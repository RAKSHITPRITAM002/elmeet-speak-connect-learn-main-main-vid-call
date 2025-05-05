
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const confirmFormSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(8, "Password must be at least 8 characters"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type ConfirmFormValues = z.infer<typeof confirmFormSchema>;

interface ResetPasswordConfirmProps {
  email: string;
  accessToken: string | null;
}

export const ResetPasswordConfirm = ({ email, accessToken }: ResetPasswordConfirmProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tokenVerified, setTokenVerified] = useState<boolean>(false);

  const confirmForm = useForm<ConfirmFormValues>({
    resolver: zodResolver(confirmFormSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    const verifyToken = async () => {
      if (!accessToken) return;
      
      try {
        console.log("Verifying access token:", accessToken.substring(0, 5) + "...");
        
        // Set the session with the access token
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: "",
        });

        if (sessionError) {
          console.error("Session error:", sessionError);
          return;
        }
        
        setTokenVerified(true);
        console.log("Token verified successfully");
      } catch (error) {
        console.error("Token verification error:", error);
      }
    };

    verifyToken();
  }, [accessToken]);

  const handleResetConfirm = async (values: ConfirmFormValues) => {
    try {
      setIsSubmitting(true);
      
      if (!accessToken) {
        toast({
          title: "Error",
          description: "No valid reset token found. Please use the link from your email again.",
          variant: "destructive",
        });
        return;
      }

      console.log("Updating password with access token", { tokenPrefix: accessToken.substring(0, 5) + "..." });
      
      // Update the user's password
      const { error } = await supabase.auth.updateUser({
        password: values.password,
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Password updated",
        description: "Your password has been successfully updated",
      });
      
      // Sign the user in with their new credentials
      if (email) {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password: values.password,
        });

        if (signInError) {
          console.error("Auto sign-in error:", signInError);
          // If auto sign-in fails, direct to login page
          navigate("/login");
          return;
        }
      }
      
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Password reset error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update password",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!accessToken) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Invalid or expired reset link</AlertTitle>
        <AlertDescription>
          The password reset link is invalid or has expired. Please request a new one.
        </AlertDescription>
        <Button
          variant="outline"
          className="mt-4 w-full"
          onClick={() => navigate("/password-reset")}
        >
          Request New Link
        </Button>
      </Alert>
    );
  }

  return (
    <Form {...confirmForm}>
      <form onSubmit={confirmForm.handleSubmit(handleResetConfirm)} className="space-y-4">
        <p className="text-sm text-gray-600 mb-4">
          Enter your new password below.
        </p>
        
        {email && (
          <div className="text-sm text-gray-600 mb-4">
            Email: <span className="font-medium">{email}</span>
          </div>
        )}
        
        <FormField
          control={confirmForm.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>New Password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="Create a new password"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={confirmForm.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm Password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="Confirm your new password"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Updating..." : "Update Password"}
        </Button>
      </form>
    </Form>
  );
};
