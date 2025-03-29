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
  setIsAuthenticated: (value: boolean) => void;  // ✅ Added this
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
  const [isAuthenticated, setIsAuthenticated] = useState(false);  // ✅ Added this
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const storedUser = localStorage.getItem("auth_user");
    if (storedUser) {
      try {
        const parsedUser: User = JSON.parse(storedUser);
        const allMfaCompleted = 
          parsedUser.mfaCompleted.password &&
          parsedUser.mfaCompleted.biometrics &&
          parsedUser.mfaCompleted.googleAuth;

        setUser(parsedUser);
        setIsAuthenticated(allMfaCompleted);
      } catch (error) {
        console.error("Failed to parse stored user", error);
      }
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/auth/me", {
          method: "GET",
          credentials: "include", // ✅ Send cookies
        });
  
        const data = await response.json();
        console.log("Auth Check Response:", data);
  
        if (response.ok && data.user) {
          setUser(data.user);
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("Failed to check authentication", error);
      } finally {
        setIsLoading(false);
      }
    };
  
    checkAuthStatus();
  }, []);
  

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials:"include"
      });
      console.log("iam okay");
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
        ...user.mfaCompleted,
        googleAuth: true,
      },
    };
    setUser(updatedUser);
    localStorage.setItem("auth_user", JSON.stringify(updatedUser));
    setIsAuthenticated(
      updatedUser.mfaCompleted.password &&
      updatedUser.mfaCompleted.biometrics &&
      updatedUser.mfaCompleted.googleAuth
    );
  };

  const logout = async() => {
    try {
      await fetch("http://localhost:5000/api/auth/logout", {
        method: "POST",
        credentials: "include", // ✅ Ensure cookies are included
      });
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem("auth_user");
    window.location.href = "/login"; // ✅ Redirect to login page after logout
    }  catch(error){
      console.error("Error logging out:", error);
    }
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
        setIsAuthenticated,
        user,
        setUser,
        isAuthenticated,
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
