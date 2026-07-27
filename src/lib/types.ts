import type { EquipmentType, ExerciseCategoryType } from "./constants";

export interface UserDTO {
  id: string;
  name: string;
  role: "TRAINER" | "STUDENT";
  weight: number | null;
  inviteCode: string | null;
  trainerId: string | null;
  createdAt: string;
}

export interface ExerciseDTO {
  id: string;
  name: string;
  category: ExerciseCategoryType;
  equipment: EquipmentType | null;
  description: string | null;
  imageUrl: string | null;
  isCustom: boolean;
}

export interface ExerciseSetDTO {
  id: string;
  order: number;
  weight: number;
  reps: number;
}

export interface ProgramExerciseDTO {
  id: string;
  exerciseId: string;
  exercise: ExerciseDTO;
  order: number;
  restSeconds: number;
  notes: string | null;
  sets: ExerciseSetDTO[];
}

export interface ProgramDTO {
  id: string;
  name: string;
  studentId: string;
  authorId: string;
  author?: UserDTO;
  isIndividual: boolean;
  createdAt: string;
  exercises: ProgramExerciseDTO[];
}

export interface SessionChangeRequestDTO {
  id: string;
  sessionId: string;
  requestedDate: string;
  requestedStartTime: string;
  requestedEndTime: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  resolvedAt: string | null;
}

export interface TrainingSessionDTO {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  title: string | null;
  studentId: string;
  student?: UserDTO;
  trainerId: string | null;
  programId: string | null;
  program: ProgramDTO | null;
  notes: string | null;
  createdBy: "TRAINER" | "STUDENT";
  reminderMinutesBefore: number | null;
  completed: boolean;
  changeRequest: SessionChangeRequestDTO | null;
}

export interface ProgressEntryDTO {
  id: string;
  studentId: string;
  exerciseId: string;
  exercise: ExerciseDTO;
  sessionId: string | null;
  setIndex: number | null;
  date: string;
  weight: number;
  reps: number;
  sets: number;
}
