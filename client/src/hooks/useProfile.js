import { useState, useEffect } from "react";
import { loadProfileFromStorage, saveProfileToStorage, getDefaultProfile } from "../models/userProfile";

export function useProfile(email) {
  const [profile, setProfile] = useState(() => loadProfileFromStorage(email));
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Sync if email changes
  useEffect(() => {
    if (email && !profile.email) {
      setProfile((prev) => ({ ...prev, email }));
    }
  }, [email]);

  const updateProfile = (updatedFields) => {
    setIsSaving(true);
    setProfile((prev) => {
      const next = { ...prev, ...updatedFields };
      saveProfileToStorage(next);
      return next;
    });

    setTimeout(() => {
      setIsSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 400);
  };

  const resetToDefault = () => {
    const defaults = getDefaultProfile(email);
    setProfile(defaults);
    saveProfileToStorage(defaults);
  };

  // Profile completeness score (0-100)
  const calculateCompleteness = () => {
    const fields = ["name", "email", "targetRole", "experience", "targetCompanies", "skills", "bio"];
    const filled = fields.filter((f) => profile[f] && profile[f].trim().length > 0);
    return Math.round((filled.length / fields.length) * 100);
  };

  return {
    profile,
    updateProfile,
    resetToDefault,
    isSaving,
    saveSuccess,
    completeness: calculateCompleteness(),
  };
}
