import { useState, useEffect } from "react";
import { loadProfileFromStorage, saveProfileToStorage, getDefaultProfile } from "../models/userProfile";
import { getProfile, saveProfile } from "../services/api";

export function useProfile(email) {
  const [profile, setProfile] = useState(() => loadProfileFromStorage(email));
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isDbSynced, setIsDbSynced] = useState(false);

  // Fetch from MongoDB backend on mount or email change
  useEffect(() => {
    if (!email) return;

    let isMounted = true;
    getProfile(email).then((remote) => {
      if (isMounted && remote) {
        setProfile((prev) => {
          const merged = { ...prev, ...remote };
          saveProfileToStorage(merged);
          return merged;
        });
        setIsDbSynced(true);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [email]);

  const updateProfile = async (updatedFields) => {
    setIsSaving(true);
    const next = { ...profile, ...updatedFields, email };

    // Update local state and localStorage immediately
    setProfile(next);
    saveProfileToStorage(next);

    // Persist to MongoDB backend
    try {
      const res = await saveProfile(next);
      if (res && res.success) {
        setIsDbSynced(true);
      }
    } catch (e) {
      console.warn("Failed to persist profile to MongoDB:", e);
    } finally {
      setIsSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  const resetToDefault = async () => {
    const defaults = getDefaultProfile(email);
    setProfile(defaults);
    saveProfileToStorage(defaults);
    try {
      await saveProfile(defaults);
    } catch (e) {
      console.warn("Could not reset on remote:", e);
    }
  };

  // Profile completeness score (0-100)
  const calculateCompleteness = () => {
    const fields = ["name", "email", "targetRole", "experience", "targetCompanies", "skills", "bio"];
    const filled = fields.filter((f) => profile[f] && String(profile[f]).trim().length > 0);
    return Math.round((filled.length / fields.length) * 100);
  };

  return {
    profile,
    updateProfile,
    resetToDefault,
    isSaving,
    saveSuccess,
    isDbSynced,
    completeness: calculateCompleteness(),
  };
}
