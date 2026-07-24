import { Dumbbell, Footprints, Zap, BicepsFlexed, CircleDot, type LucideIcon } from "lucide-react";
import type { ExerciseCategoryType } from "./constants";

export const CATEGORY_ICON: Record<ExerciseCategoryType, LucideIcon> = {
  TRAPS: Dumbbell,
  FRONT_DELTS: Zap,
  SIDE_DELTS: Zap,
  REAR_DELTS: Zap,
  CHEST: Dumbbell,
  UPPER_BACK: Dumbbell,
  BICEPS: BicepsFlexed,
  TRICEPS: BicepsFlexed,
  FOREARMS: BicepsFlexed,
  ABS: CircleDot,
  LOWER_BACK: Dumbbell,
  GLUTES: Footprints,
  HIP_ABDUCTORS: Footprints,
  HIP_ADDUCTORS: Footprints,
  QUADS: Footprints,
  HAMSTRINGS: Footprints,
  CALVES: Footprints,
};
