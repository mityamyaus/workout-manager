import {
  Dumbbell,
  Footprints,
  Zap,
  BicepsFlexed,
  CircleDot,
  HeartPulse,
  Flame,
  type LucideIcon,
} from "lucide-react";
import type { ExerciseCategoryType } from "./constants";

export const CATEGORY_ICON: Record<ExerciseCategoryType, LucideIcon> = {
  CHEST: Dumbbell,
  BACK: Dumbbell,
  LEGS: Footprints,
  SHOULDERS: Zap,
  ARMS: BicepsFlexed,
  CORE: CircleDot,
  CARDIO: HeartPulse,
  FULLBODY: Flame,
};
