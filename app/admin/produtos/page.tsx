import { redirect } from 'next/navigation';

// A lista de produtos agora vive na aba Estoque (produtos e estoque eram a
// mesma coisa em dois lugares). Cadastro e edicao continuam em /admin/produtos.
export default function ProdutosPage() {
  redirect('/admin/estoque');
}
