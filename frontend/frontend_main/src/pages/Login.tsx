
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import MfaBiometrics from "@/components/auth/MfaBiometrics";
import MfaGoogleAuthOtp from "@/components/auth/MfaGoogleAuthOtp";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const Login = () => {
  const navigate = useNavigate();
  const { login, user, resetMfaStatus } = useAuth();
  const [authStep, setAuthStep] = useState<"password" | "biometrics" | "googleAuth">("password");
  
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Reset MFA steps when component mounts
  useState(() => {
    resetMfaStatus();
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      console.log("hello");

      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email, password: data.password }),
      });


      const result = await response.json();

      if (response.ok) {
        toast.success("Login successful! Proceeding to 2FA verification");
        console.log(user);
        const success = await login(data.email, data.password);
        user.mfaCompleted.biometrics=true;
        if (success) {
        setAuthStep("biometrics");
        };

      } else {
        toast.error(result.message || "Login failed. Try again.");
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    }
  };
  const handleBiometricsComplete = () => {
    setAuthStep("googleAuth");
  };

  const handleGoogleAuthComplete = () => {
    toast.success("Authentication complete!");
    navigate("/");
  };

  // Render the current authentication step
  if (authStep === "biometrics" && user) {
    return <MfaBiometrics onComplete={handleBiometricsComplete} />;
  }

  if (authStep === "googleAuth" && user) {
    return <MfaGoogleAuthOtp onComplete={handleGoogleAuthComplete} />;
  }

  return (
    <div className="p-6">
      <div className="mb-4 text-center">
        <h2 className="text-2xl font-bold">Log In</h2>
        <p className="text-sm text-muted-foreground">
          Enter your credentials to access your vault
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="you@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Logging in..." : "Log In"}
          </Button>
        </form>
      </Form>

      <div className="mt-6 text-center text-sm">
        Don't have an account?{" "}
        <Link to="/register" className="text-primary hover:underline">
          Register
        </Link>
      </div>
    </div>
  );
};

export default Login;
