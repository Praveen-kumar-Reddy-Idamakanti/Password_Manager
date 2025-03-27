import React, { createContext, useContext, useState, useEffect } from "react";

interface User {
  id: string;
  email: string;
  mfaCompleted: {
    password: boolean;
    biometrics: boolean;
    googleAuth: boolean;
  };
}

interface AuthContextType {
  setUser: (user: User | null) => void;  // ✅ Add this line
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string) => Promise<boolean>;
  completeMfaStep: (step: "password" | "biometrics" | "googleAuth") => void;
  logout: () => void;
  validateOtp: (otp: string) => Promise<boolean>;
  setupBiometrics: () => Promise<boolean>;
  resetMfaStatus: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("auth_user");
    if (storedUser) {
      try {
        const parsedUser: User = JSON.parse(storedUser);
        setUser({
          ...parsedUser,
          mfaCompleted: parsedUser.mfaCompleted || {
            password: false,
            biometrics: false,
            googleAuth: false,
          },
        });
      } catch (error) {
        console.error("Failed to parse stored user", error);
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (response.ok) {
        const newUser: User = {
          id: data.user.id,
          email: data.user.email,
          mfaCompleted: data.user.mfaCompleted || {
            password: false,
            biometrics: false,
            googleAuth: false,
          },
        };

        setUser(newUser);
        localStorage.setItem("auth_token", data.token);
        localStorage.setItem("auth_user", JSON.stringify(newUser));
        return true;
      } else {
        console.error("Login failed:", data.message);
        return false;
      }
    } catch (error) {
      console.error("Error logging in:", error);
      return false;
    }
  };

  const register = async (email: string, password: string): Promise<boolean> => {
    try {
      const newUser: User = {
        id: crypto.randomUUID(),
        email,
        mfaCompleted: {
          password: true,
          biometrics: false,
          googleAuth: false,
        },
      };
      setUser(newUser);
      localStorage.setItem("auth_user", JSON.stringify(newUser));
      return true;
    } catch (error) {
      console.error("Registration failed", error);
      return false;
    }
  };

  const completeMfaStep = (step: "password" | "biometrics" | "googleAuth") => {
    if (!user) return;
    const updatedUser = {
      ...user,
      mfaCompleted: {
        ...user.mfaCompleted,
        [step]: true,
      },
    };
    setUser(updatedUser);
    localStorage.setItem("auth_user", JSON.stringify(updatedUser));
  };

  const resetMfaStatus = () => {
    if (!user) return;
    const updatedUser = {
      ...user,
      mfaCompleted: {
        password: true,
        biometrics: false,
        googleAuth: false,
      },
    };
    setUser(updatedUser);
    localStorage.setItem("auth_user", JSON.stringify(updatedUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("auth_user");
    localStorage.removeItem("auth_token");
    window.location.href = "/login"; // ✅ Redirect to login page after logout
  };

  const validateOtp = async (otp: string): Promise<boolean> => {
    return otp.length === 6 && /^\d+$/.test(otp);
  };

  const setupBiometrics = async (): Promise<boolean> => {
    try {
      if (!window.PublicKeyCredential) {
        console.error("WebAuthn not supported in this browser");
        return false;
      }
      return true;
    } catch (error) {
      console.error("Biometrics setup failed", error);
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        isAuthenticated:
          !!user &&
          user.mfaCompleted?.password &&
          user.mfaCompleted?.biometrics &&
          user.mfaCompleted?.googleAuth,
        isLoading,
        login,
        register,
        completeMfaStep,
        logout,
        validateOtp,
        setupBiometrics,
        resetMfaStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
