export const ROLES = {
  TRAINER: "TRAINER",
  STUDENT: "STUDENT",
} as const;

export type RoleType = (typeof ROLES)[keyof typeof ROLES];

// Группы мышц (заменяют прежнюю укрупнённую разбивку CHEST/BACK/LEGS/...)
export const EXERCISE_CATEGORIES = {
  TRAPS: "TRAPS",
  FRONT_DELTS: "FRONT_DELTS",
  SIDE_DELTS: "SIDE_DELTS",
  REAR_DELTS: "REAR_DELTS",
  CHEST: "CHEST",
  UPPER_BACK: "UPPER_BACK",
  BICEPS: "BICEPS",
  TRICEPS: "TRICEPS",
  FOREARMS: "FOREARMS",
  ABS: "ABS",
  LOWER_BACK: "LOWER_BACK",
  GLUTES: "GLUTES",
  HIP_ABDUCTORS: "HIP_ABDUCTORS",
  HIP_ADDUCTORS: "HIP_ADDUCTORS",
  QUADS: "QUADS",
  HAMSTRINGS: "HAMSTRINGS",
  CALVES: "CALVES",
} as const;

export type ExerciseCategoryType =
  (typeof EXERCISE_CATEGORIES)[keyof typeof EXERCISE_CATEGORIES];

export const CATEGORY_LABELS: Record<ExerciseCategoryType, string> = {
  TRAPS: "Трапеции",
  FRONT_DELTS: "Передние дельты",
  SIDE_DELTS: "Боковые дельты",
  REAR_DELTS: "Задние дельты",
  CHEST: "Грудь",
  UPPER_BACK: "Верхняя часть спины",
  BICEPS: "Бицепсы",
  TRICEPS: "Трицепсы",
  FOREARMS: "Предплечья",
  ABS: "Пресс",
  LOWER_BACK: "Нижняя часть спины",
  GLUTES: "Ягодицы",
  HIP_ABDUCTORS: "Отводящие мышцы бедра",
  HIP_ADDUCTORS: "Приводящие мышцы бедра",
  QUADS: "Квадрицепсы",
  HAMSTRINGS: "Бицепс бедра",
  CALVES: "Икры",
};

export const CATEGORY_COLORS: Record<ExerciseCategoryType, string> = {
  TRAPS: "#0d9488",
  FRONT_DELTS: "#0891b2",
  SIDE_DELTS: "#0e7490",
  REAR_DELTS: "#155e75",
  CHEST: "#16a34a",
  UPPER_BACK: "#059669",
  BICEPS: "#15803d",
  TRICEPS: "#166534",
  FOREARMS: "#4d7c0f",
  ABS: "#84cc16",
  LOWER_BACK: "#65a30d",
  GLUTES: "#ca8a04",
  HIP_ABDUCTORS: "#a16207",
  HIP_ADDUCTORS: "#b45309",
  QUADS: "#0369a1",
  HAMSTRINGS: "#0284c7",
  CALVES: "#0d9488",
};

// Резервные геттеры: старые/неизвестные значения category (например, оставшиеся
// в базе от прежней таксономии CHEST/BACK/LEGS/...) не должны приводить к падению UI.
export function getCategoryLabel(category: string): string {
  return CATEGORY_LABELS[category as ExerciseCategoryType] ?? category;
}

export function getCategoryColor(category: string): string {
  return CATEGORY_COLORS[category as ExerciseCategoryType] ?? "#6b7280";
}

// Оборудование, используемое в упражнении
export const EQUIPMENT_TYPES = {
  BARBELL: "BARBELL",
  DUMBBELL: "DUMBBELL",
  EZ_BAR: "EZ_BAR",
  SMITH_MACHINE: "SMITH_MACHINE",
  MACHINE: "MACHINE",
  CABLE: "CABLE",
  KETTLEBELL: "KETTLEBELL",
  BODYWEIGHT: "BODYWEIGHT",
  ASSISTED_BODYWEIGHT: "ASSISTED_BODYWEIGHT",
  TIME: "TIME",
  CARDIO: "CARDIO",
} as const;

export type EquipmentType = (typeof EQUIPMENT_TYPES)[keyof typeof EQUIPMENT_TYPES];

export const EQUIPMENT_LABELS: Record<EquipmentType, string> = {
  BARBELL: "Штанга",
  DUMBBELL: "Гантель",
  EZ_BAR: "EZ-образная штанга",
  SMITH_MACHINE: "Машина Смита",
  MACHINE: "Тренажёр",
  CABLE: "Кабель",
  KETTLEBELL: "Гиря",
  BODYWEIGHT: "Собственный вес",
  ASSISTED_BODYWEIGHT: "Собственный вес с поддержкой",
  TIME: "Время",
  CARDIO: "Кардио",
};
