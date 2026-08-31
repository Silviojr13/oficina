// Os formularios enviam datas como string "YYYY-MM-DD" (do <input type="date">),
// mas o Prisma 7 exige um DateTime ISO-8601 completo - uma string so de data
// ("2026-08-31") falha com "premature end of input. Expected ISO-8601 DateTime."
// Usar antes de qualquer prisma.<model>.create()/update() que receba campos
// DateTime vindos direto de um formulario.
export function parseDateFields<T extends Record<string, unknown>>(
  data: T,
  fields: (keyof T)[]
): T {
  const result = { ...data };
  for (const field of fields) {
    const value = result[field];
    if (typeof value === 'string') {
      (result as Record<keyof T, unknown>)[field] = value ? new Date(value) : null;
    }
  }
  return result;
}
