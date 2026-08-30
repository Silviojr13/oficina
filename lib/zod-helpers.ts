import { z } from 'zod';

// react-hook-form's valueAsNumber devolve NaN (nao undefined) quando um
// input numerico opcional fica vazio - e z.number().optional() rejeita
// NaN, travando a validacao do formulario inteiro mesmo o campo nunca
// tendo sido preenchido.
export function optionalNumber<T extends z.ZodTypeAny>(schema: T) {
  return z.preprocess((val) => (typeof val === 'number' && Number.isNaN(val) ? undefined : val), schema);
}
