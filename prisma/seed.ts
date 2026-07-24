import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const exercises: { name: string; category: string; description?: string }[] = [
  // Грудь
  { name: "Жим штанги лёжа", category: "CHEST", description: "Базовое упражнение на грудные мышцы" },
  { name: "Жим гантелей лёжа", category: "CHEST" },
  { name: "Жим штанги на наклонной скамье", category: "CHEST" },
  { name: "Разведение гантелей лёжа", category: "CHEST" },
  { name: "Отжимания на брусьях", category: "CHEST" },
  { name: "Сведение рук в кроссовере", category: "CHEST" },
  // Спина
  { name: "Становая тяга", category: "BACK", description: "Базовое упражнение на всю заднюю цепь" },
  { name: "Подтягивания широким хватом", category: "BACK" },
  { name: "Тяга штанги в наклоне", category: "BACK" },
  { name: "Тяга верхнего блока", category: "BACK" },
  { name: "Тяга гантели в наклоне", category: "BACK" },
  { name: "Гиперэкстензия", category: "BACK" },
  // Ноги
  { name: "Приседания со штангой", category: "LEGS", description: "Базовое упражнение на квадрицепс и ягодицы" },
  { name: "Жим ногами в тренажёре", category: "LEGS" },
  { name: "Румынская тяга", category: "LEGS" },
  { name: "Выпады с гантелями", category: "LEGS" },
  { name: "Разгибание ног в тренажёре", category: "LEGS" },
  { name: "Сгибание ног в тренажёре", category: "LEGS" },
  { name: "Подъём на носки (икры)", category: "LEGS" },
  // Плечи
  { name: "Жим штанги стоя", category: "SHOULDERS" },
  { name: "Жим гантелей сидя", category: "SHOULDERS" },
  { name: "Махи гантелями в стороны", category: "SHOULDERS" },
  { name: "Махи гантелями в наклоне", category: "SHOULDERS" },
  { name: "Тяга штанги к подбородку", category: "SHOULDERS" },
  // Руки
  { name: "Подъём штанги на бицепс", category: "ARMS" },
  { name: "Подъём гантелей на бицепс", category: "ARMS" },
  { name: "Французский жим", category: "ARMS" },
  { name: "Жим узким хватом", category: "ARMS" },
  { name: "Разгибание рук на блоке", category: "ARMS" },
  { name: "Молотковые сгибания", category: "ARMS" },
  // Кор / пресс
  { name: "Скручивания", category: "CORE" },
  { name: "Планка", category: "CORE" },
  { name: "Подъём ног в висе", category: "CORE" },
  { name: "Русский твист", category: "CORE" },
  // Кардио
  { name: "Бег на дорожке", category: "CARDIO" },
  { name: "Скакалка", category: "CARDIO" },
  { name: "Гребной тренажёр", category: "CARDIO" },
  { name: "Велотренажёр", category: "CARDIO" },
  // Всё тело
  { name: "Берпи", category: "FULLBODY" },
  { name: "Толчок штанги", category: "FULLBODY" },
  { name: "Рывок гири", category: "FULLBODY" },
];

async function main() {
  for (const ex of exercises) {
    const existing = await prisma.exercise.findFirst({ where: { name: ex.name } });
    if (!existing) {
      await prisma.exercise.create({ data: ex });
    }
  }
  console.log(`Seed complete: ${exercises.length} exercises ensured.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
