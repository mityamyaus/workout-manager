"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserCog, ArrowLeft } from "lucide-react";
import { useCurrentUser } from "@/context/current-user";

export default function RegisterPage() {
  const { chooseTrainer } = useCurrentUser();
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim() || !email.trim() || !password) return;
    setBusy(true);
    setError(null);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), email: email.trim(), password }),
    });
    setBusy(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Не удалось зарегистрироваться");
      return;
    }
    const trainer = await res.json();
    chooseTrainer(trainer.id);
    router.push("/trainer");
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-1 pt-10 pb-10">
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
        style={{ backgroundColor: "#16a34a1f", color: "#16a34a" }}
      >
        <UserCog size={30} strokeWidth={1.75} />
      </div>
      <div className="text-center space-y-1 mb-8">
        <h1 className="text-2xl font-bold">Регистрация тренера</h1>
        <p className="text-gray-400 text-sm">Создайте кабинет и добавляйте учеников</p>
      </div>

      <div className="w-full max-w-sm space-y-3">
        <Link href="/login" className="flex items-center gap-1 text-sm text-gray-400 font-medium">
          <ArrowLeft size={15} /> назад
        </Link>
        <div className="card p-5 space-y-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ваше имя"
            className="w-full rounded-2xl border border-gray-200 px-4 py-3"
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full rounded-2xl border border-gray-200 px-4 py-3"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Пароль (минимум 6 символов)"
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            className="w-full rounded-2xl border border-gray-200 px-4 py-3"
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button
            disabled={!name.trim() || !email.trim() || !password || busy}
            onClick={handleSubmit}
            className="btn-primary w-full"
          >
            Зарегистрироваться
          </button>
          <p className="text-sm text-gray-500 text-center">
            Уже есть аккаунт?{" "}
            <Link href="/login" className="font-medium text-gray-900">
              Войти
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
