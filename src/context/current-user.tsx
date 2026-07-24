"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

type Role = "TRAINER" | "STUDENT";

interface CurrentUserState {
  role: Role | null;
  studentId: string | null;
  trainerId: string | null;
  loading: boolean;
  chooseTrainer: (trainerId: string) => void;
  chooseStudent: (studentId: string, trainerId: string) => void;
  reset: () => void;
}

const CurrentUserContext = createContext<CurrentUserState | null>(null);

const STORAGE_KEY = "train-manager:current-user";

export function CurrentUserProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role | null>(null);
  const [studentId, setStudentId] = useState<string | null>(null);
  const [trainerId, setTrainerId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setRole(parsed.role ?? null);
        setStudentId(parsed.studentId ?? null);
        setTrainerId(parsed.trainerId ?? null);
      }
    } catch {
      // ignore corrupted storage
    }
    setLoading(false);
  }, []);

  const persist = (next: { role: Role | null; studentId: string | null; trainerId: string | null }) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const chooseTrainer = (id: string) => {
    setRole("TRAINER");
    setTrainerId(id);
    setStudentId(null);
    persist({ role: "TRAINER", studentId: null, trainerId: id });
  };

  const chooseStudent = (sId: string, tId: string) => {
    setRole("STUDENT");
    setStudentId(sId);
    setTrainerId(tId);
    persist({ role: "STUDENT", studentId: sId, trainerId: tId });
  };

  const reset = () => {
    setRole(null);
    setStudentId(null);
    setTrainerId(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <CurrentUserContext.Provider
      value={{ role, studentId, trainerId, loading, chooseTrainer, chooseStudent, reset }}
    >
      {children}
    </CurrentUserContext.Provider>
  );
}

export function useCurrentUser() {
  const ctx = useContext(CurrentUserContext);
  if (!ctx) throw new Error("useCurrentUser must be used within CurrentUserProvider");
  return ctx;
}
