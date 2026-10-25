import React, { createContext, useState, useEffect, useContext } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("campusride_token") || null);
  const [loading, setLoading] = useState(true);

  // Check current user if token exists on load
  useEffect(() => {
    const fetchCurrentUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch("/api/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (data.success) {
          setUser(data.user);
        } else {
          // Token expired or invalid
          logout();
        }
      } catch (err) {
        console.error("Failed to load user:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, [token]);

  const login = async (email, password) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || "Failed to log in");
    }
    localStorage.setItem("campusride_token", data.token);
    setToken(data.token);
    setUser(data.user);
    return data;
  };

  const register = async (formData) => {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || "Failed to register");
    }
    localStorage.setItem("campusride_token", data.token);
    setToken(data.token);
    setUser(data.user);
    return data;
  };

  const refreshUser = async () => {
    if (!token) return;
    try {
      const res = await fetch("/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
      }
    } catch (err) {
      console.error("Failed to refresh user:", err);
    }
  };

  const logout = () => {
    localStorage.removeItem("campusride_token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        refreshUser,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
