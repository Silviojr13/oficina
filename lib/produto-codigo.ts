// Acha, numa lista ja carregada, o produto dono de um codigo lido pelo
// leitor de codigo de barras - mesma regra de buscarProdutoPorCodigo no
// servidor: EAN do fabricante, SKU interno ou codigo OEM, comparacao exata.
type ComCodigos = {
  codigoBarras?: string | null;
  sku?: string | null;
  codigoOEM?: string | null;
};

export function encontrarProdutoPorCodigo<T extends ComCodigos>(produtos: T[], codigo: string): T | undefined {
  const termo = codigo.trim().toUpperCase();
  if (!termo) return undefined;
  return produtos.find((p) =>
    [p.codigoBarras, p.sku, p.codigoOEM].some((c) => c && c.trim().toUpperCase() === termo)
  );
}

export function mensagemCodigoNaoCadastrado(codigo: string) {
  return `Código ${codigo} não está cadastrado em nenhum produto.`;
}
