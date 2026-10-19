// Busca de texto tolerante, usada nas listas de produtos: sem acento e sem
// diferenciar maiusculas ("oleo" acha "Óleo"), e todas as palavras digitadas
// precisam aparecer ("pastilha bosch" acha so as pastilhas da Bosch).
export function normalizar(texto: string) {
  return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

export function textoDeBusca(...partes: (string | null | undefined)[]) {
  return normalizar(partes.filter(Boolean).join(' '));
}

export function combinaBusca(textoIndexado: string, busca: string) {
  const palavras = normalizar(busca).split(/\s+/).filter(Boolean);
  return palavras.every((palavra) => textoIndexado.includes(palavra));
}
