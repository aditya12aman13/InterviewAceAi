import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export function useAuth() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(
    () => localStorage.getItem("isLoggedIn") === "true"
  );
  const [userEmail, setUserEmail] = useState(
    () => localStorage.getItem("userEmail") || ""
  );

  const login = (email) => {
    const cleanEmail = email.trim();
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("userEmail", cleanEmail);
    setIsLoggedIn(true);
    setUserEmail(cleanEmail);
    navigate("/dashboard", { replace: true });
  };

  const logout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userEmail");
    setIsLoggedIn(false);
    setUserEmail("");
    navigate("/", { replace: true });
  };

  return {
    isLoggedIn,
    userEmail,
    login,
    logout,
  };
}
