
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
import MfaGoogleAuthScanner from "@/components/auth/MfaGoogleAuthScanner";
const registerSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

const Register = () => {
  const navigate = useNavigate();
  const { register, user ,setUser} = useAuth();
  const [authStep, setAuthStep] = useState<"password" | "biometrics" | "googleAuth">("password");
  
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      const response = await fetch("http://localhost:5000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email, password: data.password }),
      });
  
      const result = await response.json();
      
      if (response.ok) {
        toast.success("Registration successful! Setting up 2FA");
        const newUser = {id: crypto.randomUUID(),  email: data.email, mfaCompleted: { password: true, biometrics: false, googleAuth: false } };
        setUser(newUser);
        setAuthStep("biometrics");
         // ✅ Update AuthContext state
        await new Promise((resolve) => setTimeout(resolve, 0)); // Ensure state update
        console.log("Redirecting to biometrics..."); // Debugging
      } else {
        toast.error(result.message || "Registration failed. Try again.");
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    }
  };

  const handleBiometricsComplete = () => {
    setAuthStep("googleAuth");
  };

  const handleGoogleAuthComplete = () => {
    toast.success("Account setup complete!");
    navigate("/login");
  };

  // Render the current authentication step
  if (authStep === "biometrics" && user) {
    return <MfaBiometrics onComplete={handleBiometricsComplete} />;
  }

  if (authStep === "googleAuth" && user) {
    return <MfaGoogleAuthScanner onComplete={handleGoogleAuthComplete} />;
  }

  return (
    <div className="p-6">
      <div className="mb-4 text-center">
        <h2 className="text-2xl font-bold">Create Account</h2>
        <p className="text-sm text-muted-foreground">
          Register to secure your passwords
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

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Creating Account..." : "Create Account"}
          </Button>
        </form>
      </Form>

      <div className="mt-6 text-center text-sm">
        Already have an account?{" "}
        <Link to="/login" className="text-primary hover:underline">
          Log In
        </Link>
      </div>
    </div>
  );
};

export default Register;
