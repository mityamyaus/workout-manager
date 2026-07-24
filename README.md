# Тренировки

Веб-приложение для тренера и ученика: календарь тренировок, программы упражнений и графики прогресса. Работает как обычный сайт и устанавливается на домашний экран телефона (PWA).

## Стек

- Next.js (App Router) + TypeScript + Tailwind CSS
- Prisma + PostgreSQL
- Recharts (графики прогресса)
- PWA: `manifest.json` + service worker для установки на телефон

Тренер регистрируется по email/паролю (сессия по httpOnly cookie) и получает свой изолированный кабинет — учеников других тренеров не видно. Ученик заходит без пароля по короткому коду, который выдаёт тренер.

## Нужна база данных Postgres

Приложению нужна настоящая PostgreSQL-база (и локально, и на проде) — бесплатный вариант можно получить за пару минут:

- **Через Vercel** (проще всего для деплоя): в проекте на vercel.com → вкладка **Storage** → **Create Database** → выбрать **Postgres** (на базе Neon). Vercel сам создаст переменную окружения с строкой подключения.
- **Или отдельно**: [neon.tech](https://neon.tech) / [supabase.com](https://supabase.com) — бесплатный тариф, после регистрации скопировать connection string вида `postgresql://user:password@host/dbname?sslmode=require`.

Полученную строку нужно положить в `DATABASE_URL` — локально в файл `.env`, на Vercel — в Project Settings → Environment Variables (имя переменной должно быть именно `DATABASE_URL`; если Vercel создал `POSTGRES_URL` или `POSTGRES_PRISMA_URL` — скопируйте её значение в отдельную переменную `DATABASE_URL`).

## Локальный запуск

```bash
npm install
# положите свою строку подключения в .env → DATABASE_URL=...
npx prisma migrate dev --name init
npm run seed
npm run dev
```

Открыть [http://localhost:3000](http://localhost:3000).

`npm run seed` наполняет базу библиотекой из ~40 силовых упражнений. Команда безопасна для повторного запуска (не создаёт дубли).

Если после этого меняли `prisma/schema.prisma` — накатить новую миграцию:

```bash
npx prisma migrate dev
```

## Деплой на Vercel

1. **Загрузите код на GitHub** (если ещё не сделали):
   ```bash
   git add -A
   git commit -m "Initial commit"
   ```
   Создайте пустой репозиторий на github.com и выполните команды, которые GitHub покажет для `git remote add origin ...` и `git push -u origin main`.

2. **На vercel.com**: New Project → Import выбранный репозиторий → Deploy (Next.js определится автоматически, специальных настроек build command не требуется — используется `vercel-build` из `package.json`, который сам накатывает миграции и сид при каждом деплое).

3. **Добавьте базу данных**: в проекте на Vercel → Storage → Create Database → Postgres. Убедитесь, что в Environment Variables проекта есть `DATABASE_URL` со строкой подключения (см. раздел выше).

4. **Передеплойте** (Deployments → на последнем деплое ⋯ → Redeploy), чтобы сборка подхватила `DATABASE_URL` и накатила миграции/сид в свежую базу.

5. Готово — откройте выданный Vercel адрес (`https://ваш-проект.vercel.app`) с телефона, зарегистрируйте тренера и проверьте весь функционал.

### Установка на домашний экран iPhone

В Safari откройте задеплоенный сайт → кнопка "Поделиться" → "На экран «Домой»". Приложение откроется в полноэкранном режиме, без адресной строки, как обычное приложение.

### Быстрый деплой без GitHub (Vercel CLI)

```bash
npm i -g vercel
vercel login
vercel
vercel env add DATABASE_URL production
vercel --prod
```

## Структура

- `prisma/schema.prisma` — модели: User (тренер/ученик, у тренера email+passwordHash), Session (сессии тренера), Exercise (библиотека упражнений), Program + ProgramExercise + ExerciseSet (программа тренировок с сетами), TrainingSession + SessionChangeRequest (календарь и заявки на перенос), ProgressEntry (результаты для графиков)
- `src/lib/auth.ts` — хеширование пароля (bcryptjs) и сессии по cookie
- `src/app/api/auth/*` — регистрация/вход/выход/проверка сессии тренера
- `src/app/api/*` — остальные серверные роуты (CRUD)
- `src/app/login`, `src/app/register` — вход и регистрация тренера
- `src/app/trainer` — кабинет тренера (список своих учеников → карточка ученика: календарь / программы / прогресс, без запуска тренировки — это менеджерская роль)
- `src/app/student` — кабинет ученика (календарь, программы, прогресс, таймер тренировки)
- `src/components` — календарь, конструктор программы, форма тренировки, графики прогресса, таймер тренировки

## Что дальше можно добавить

- Картинки/видео для упражнений (сейчас вместо фото — иконки по категории)
- Восстановление пароля тренера по email
- Настоящие push-уведомления в закрытое приложение (нужен push-сервер с VAPID)
