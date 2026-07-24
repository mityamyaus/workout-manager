-- Переносим упражнения, оставшиеся со старой (укрупнённой) таксономии категорий,
-- на новые группы мышц. Точного 1:1 соответствия нет (например, старая LEGS
-- включала квадрицепсы, бицепс бедра, икры, ягодицы и т.д.), поэтому выбран
-- разумный дефолт для каждой старой категории; equipment заполняется только
-- если он ещё не задан.
UPDATE "Exercise" SET category = 'UPPER_BACK', equipment = COALESCE(equipment, 'BARBELL') WHERE category = 'BACK';
UPDATE "Exercise" SET category = 'QUADS', equipment = COALESCE(equipment, 'BARBELL') WHERE category = 'LEGS';
UPDATE "Exercise" SET category = 'SIDE_DELTS', equipment = COALESCE(equipment, 'DUMBBELL') WHERE category = 'SHOULDERS';
UPDATE "Exercise" SET category = 'BICEPS', equipment = COALESCE(equipment, 'DUMBBELL') WHERE category = 'ARMS';
UPDATE "Exercise" SET category = 'ABS', equipment = COALESCE(equipment, 'BODYWEIGHT') WHERE category = 'CORE';
UPDATE "Exercise" SET category = 'QUADS', equipment = COALESCE(equipment, 'CARDIO') WHERE category = 'CARDIO';
UPDATE "Exercise" SET category = 'ABS', equipment = COALESCE(equipment, 'BODYWEIGHT') WHERE category = 'FULLBODY';
