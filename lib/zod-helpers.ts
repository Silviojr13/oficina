import { z } from 'zod';
import type { FieldErrors } from 'react-hook-form';
import { toast } from 'sonner';

// react-hook-form's valueAsNumber devolve NaN (nao undefined) quando um
// input numerico opcional fica vazio - e z.number().optional() rejeita
// NaN, travando a validacao do formulario inteiro mesmo o campo nunca
// tendo sido preenchido.
export function optionalNumber<T extends z.ZodTypeAny>(schema: T) {
  return z.preprocess((val) => (typeof val === 'number' && Number.isNaN(val) ? undefined : val), schema);
}

// Colunas vazias no banco vem como null (nao undefined), mas .optional()
// no zod so aceita undefined - null sempre falha, mesmo em campos sem
// nenhuma outra restricao. Isso trava a edicao de QUALQUER registro que
// tenha um campo opcional nunca preenchido, principalmente os que nem tem
// input renderizado no formulario (o valor de defaultValues vai direto
// pro submit sem passar por um <input>, que normalmente converteria
// null/undefined em ""). Usar no spread de defaultValues:
// defaultValues: { ...nullsToUndefined(initialData), ... }
export function nullsToUndefined<T extends Record<string, unknown>>(obj: T | null | undefined): Partial<T> {
  if (!obj) return {};
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    result[key] = value === null ? undefined : value;
  }
  return result as Partial<T>;
}

// Ultima linha de defesa contra o "clico e nao acontece nada": se a
// validacao falhar por qualquer motivo - inclusive um campo que ainda nao
// pensamos em cobrir, ou um erro que caiu numa aba/tab que nao esta
// visivel no momento - o usuario recebe um toast em vez de silencio.
// Uso: <form onSubmit={handleSubmit(handleFormSubmit, avisarErroValidacao)}>
export function avisarErroValidacao(errors: FieldErrors) {
  const campos = Object.keys(errors);
  toast.error('Não foi possível salvar: verifique os campos destacados.', {
    description: campos.length ? `Campo(s) com erro: ${campos.join(', ')}` : undefined,
  });
}
