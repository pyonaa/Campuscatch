import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { toast } from "sonner";

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const MOCK_MODE = true;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (MOCK_MODE) {
      const storedUser = localStorage.getItem("mockUser");
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setAccessToken("mock-token-123");
      }
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      if (MOCK_MODE) {
        await new Promise(resolve => setTimeout(resolve, 500));

        const mockUser = {
          id: "mock-user-id",
          email: email,
          name: email.split("@")[0],
        };

        setUser(mockUser);
        setAccessToken("mock-token-123");
        localStorage.setItem("mockUser", JSON.stringify(mockUser));
        toast.success("Logged in successfully!");
        return;
      }
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const loginWithGoogle = async () => {
    try {
      if (MOCK_MODE) {
        await new Promise(resolve => setTimeout(resolve, 500));

        const mockUser = {
          id: "mock-user-id",
          email: "demo@campuscatch.com",
          name: "Demo User",
        };

        setUser(mockUser);
        setAccessToken("mock-token-123");
        localStorage.setItem("mockUser", JSON.stringify(mockUser));
        toast.success("Logged in successfully!");
        return;
      }
    } catch (error) {
      console.error("Google login error:", error);
      throw error;
    }
  };

  const signup = async (email: string, password: string, name: string) => {
    try {
      if (MOCK_MODE) {
        await new Promise(resolve => setTimeout(resolve, 500));

        const mockUser = {
          id: "mock-user-id",
          email: email,
          name: name,
        };

        setUser(mockUser);
        setAccessToken("mock-token-123");
        localStorage.setItem("mockUser", JSON.stringify(mockUser));
        toast.success("Account created successfully!");
        return;
      }
    } catch (error) {
      console.error("Signup error:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      if (MOCK_MODE) {
        setUser(null);
        setAccessToken(null);
        localStorage.removeItem("mockUser");
        toast.success("Logged out successfully!");
        return;
      }
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to logout");
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      accessToken,
      login, 
      loginWithGoogle,
      signup, 
      logout, 
      isAuthenticated: !!user,
      isLoading 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}