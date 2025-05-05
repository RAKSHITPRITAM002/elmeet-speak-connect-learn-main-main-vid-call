
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const resetFormSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type ResetFormValues = z.infer<typeof resetFormSchema>;

interface ResetPasswordRequestProps {
  onSuccess: (email: string) => void;
}

export const ResetPasswordRequest = ({ onSuccess }: ResetPasswordRequestProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const resetForm = useForm<ResetFormValues>({
    resolver: zodResolver(resetFormSchema),
    defaultValues: {
      email: "",
    },
  });

  const handleResetRequest = async (values: ResetFormValues) => {
    try {
      setIsSubmitting(true);
      
      // Get the absolute URL for the password reset page
      const resetUrl = `${window.location.origin}/password-reset`;
      console.log("Reset redirect URL:", resetUrl);
      
      // The redirectTo option tells Supabase where to redirect after the user clicks the reset link
      const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
        redirectTo: resetUrl,
      });

      if (error) {
        throw error;
      }

      onSuccess(values.email);
      
      toast({
        title: "Reset email sent",
        description: "Check your email for the password reset link",
      });
    } catch (error: any) {
      console.error("Password reset request error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to send reset email",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...resetForm}>
      <form onSubmit={resetForm.handleSubmit(handleResetRequest)} className="space-y-4">
        <FormField
          control={resetForm.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter your email address"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Sending..." : "Send Reset Link"}
        </Button>
        
        <div className="text-center mt-4">
          <Button
            variant="link"
            className="text-sm"
            onClick={() => navigate("/login")}
          >
            Back to Login
          </Button>
        </div>
      </form>
    </Form>
  );
};
