// Безопасный fetch: никогда не бросает и не возвращает не-JSON/ошибочный ответ вызывающему.
// Не позволяет ответам вида {error: "..."} (401/403/500) попасть в состояние, ожидающее массив/объект.
export async function fetchJson<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T | null> {
  try {
    const res = await fetch(input, init);
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}
