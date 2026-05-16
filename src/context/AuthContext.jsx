import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { apiRequest, getStoredToken, setStoredToken } from "../api/apiClient";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    const token = getStoredToken();

    if (!token) {
      setBooting(false);
      return;
    }

    apiRequest("/auth/me")
      .then(setUser)
      .catch(() => {
        setStoredToken(null);
        setUser(null);
      })
      .finally(() => setBooting(false));
  }, []);

  const value = useMemo(
    () => ({
      user,
      booting,
      isAdmin: user?.roles?.includes("admin"),
      isTeacher: user?.roles?.includes("teacher") || user?.roles?.includes("admin"),
      async login(login, password) {
        const data = await apiRequest("/auth/login", {
          method: "POST",
          body: JSON.stringify({ login, password }),
        });
        setStoredToken(data.token);
        setUser(data.user);
        return data.user;
      },
      async logout() {
        try {
          await apiRequest("/auth/logout", { method: "POST", body: JSON.stringify({}) });
        } catch {
          // Local logout should still complete if the token is already invalid.
        }
        setStoredToken(null);
        setUser(null);
      },
    }),
    [booting, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
