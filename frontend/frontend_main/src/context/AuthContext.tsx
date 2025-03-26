
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
    // Check if user is logged in from localStorage
    const storedUser = localStorage.getItem("auth_user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Failed to parse stored user", error);
      }
    }
    
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // In a real application, this would be an API call
      // For demo, we'll simulate a successful login
      const newUser: User = {
        id: crypto.randomUUID(),
        email,
        mfaCompleted: {
          password: true,
          biometrics: false,
          googleAuth: false,
        }
      };
      
      setUser(newUser);
      localStorage.setItem("auth_user", JSON.stringify(newUser));
      return true;
    } catch (error) {
      console.error("Login failed", error);
      return false;
    }
  };

  const register = async (email: string, password: string): Promise<boolean> => {
    try {
      // In a real application, this would be an API call
      // For demo, we'll simulate a successful registration
      const newUser: User = {
        id: crypto.randomUUID(),
        email,
        mfaCompleted: {
          password: true,
          biometrics: false,
          googleAuth: false,
        }
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
      }
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
      }
    };
    
    setUser(updatedUser);
    localStorage.setItem("auth_user", JSON.stringify(updatedUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("auth_user");
  };

  const validateOtp = async (otp: string): Promise<boolean> => {
    // In a real application, this would validate against a server
    // For demo, we'll accept any 6-digit code
    return otp.length === 6 && /^\d+$/.test(otp);
  };

  const setupBiometrics = async (): Promise<boolean> => {
    try {
      // Check if browser supports WebAuthn
      if (!window.PublicKeyCredential) {
        console.error("WebAuthn not supported in this browser");
        return false;
      }
      
      // In a real app, this would involve actual WebAuthn registration
      // For demo purposes, we'll simulate success
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
        isAuthenticated: !!user && 
          user.mfaCompleted.password && 
          user.mfaCompleted.biometrics && 
          user.mfaCompleted.googleAuth,
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
