// Отслеживает завершение тренировок, запущенных не из календаря, а прямо со
// вкладки "Программы" (там нет TrainingSession, поэтому серверный расчёт
// session.completed не применим - это чисто клиентская, посуточная отметка).
const KEY_PREFIX = "train-manager:adhoc-completed:";

function keyFor(studentId: string) {
  return `${KEY_PREFIX}${studentId}`;
}

function load(studentId: string): Set<string> {
  try {
    const raw = localStorage.getItem(keyFor(studentId));
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
}

export function markAdhocCompleted(studentId: string, programId: string, date: string) {
  const set = load(studentId);
  set.add(`${programId}:${date}`);
  localStorage.setItem(keyFor(studentId), JSON.stringify([...set]));
}

export function loadAdhocCompletedProgramIds(studentId: string, date: string): Set<string> {
  const ids = new Set<string>();
  for (const entry of load(studentId)) {
    const [programId, entryDate] = entry.split(":");
    if (entryDate === date) ids.add(programId);
  }
  return ids;
}
