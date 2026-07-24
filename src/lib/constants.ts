export const ROLES = {
  TRAINER: "TRAINER",
  STUDENT: "STUDENT",
} as const;

export type RoleType = (typeof ROLES)[keyof typeof ROLES];

export const EXERCISE_CATEGORIES = {
  CHEST: "CHEST",
  BACK: "BACK",
  LEGS: "LEGS",
  SHOULDERS: "SHOULDERS",
  ARMS: "ARMS",
  CORE: "CORE",
  CARDIO: "CARDIO",
  FULLBODY: "FULLBODY",
} as const;

export type ExerciseCategoryType =
  (typeof EXERCISE_CATEGORIES)[keyof typeof EXERCISE_CATEGORIES];

export const CATEGORY_LABELS: Record<ExerciseCategoryType, string> = {
  CHEST: "Грудь",
  BACK: "Спина",
  LEGS: "Ноги",
  SHOULDERS: "Плечи",
  ARMS: "Руки",
  CORE: "Пресс / кор",
  CARDIO: "Кардио",
  FULLBODY: "Всё тело",
};

export const CATEGORY_COLORS: Record<ExerciseCategoryType, string> = {
  CHEST: "#16a34a",
  BACK: "#059669",
  LEGS: "#65a30d",
  SHOULDERS: "#0d9488",
  ARMS: "#15803d",
  CORE: "#84cc16",
  CARDIO: "#10b981",
  FULLBODY: "#166534",
};
