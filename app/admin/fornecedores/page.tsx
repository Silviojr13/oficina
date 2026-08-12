import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// Removed unused Badge import
import { Fornecedor } from '@/lib/types';
import { fornecedores } from '@/lib/mock-data';

export default function SuppliersPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8">Fornecedores</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {fornecedores.map((fornecedor: Fornecedor) => (
          <Card key={fornecedor.id} className="overflow-hidden">
            <CardHeader className="bg-muted/50">
              <CardTitle>{fornecedor.nomeFantasia}</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Razão Social</h3>
                  <p className="text-sm">{fornecedor.razaoSocial}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">CNPJ</h3>
                  <p className="text-sm">{fornecedor.cnpj}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Contato</h3>
                  <p className="text-sm">{fornecedor.contato}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Telefone</h3>
                  <p className="text-sm">{fornecedor.telefone}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Email</h3>
                  <p className="text-sm">{fornecedor.email}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Endereço</h3>
                  <p className="text-sm">{fornecedor.endereco.logradouro}, {fornecedor.endereco.numero}, {fornecedor.endereco.bairro}, {fornecedor.endereco.cidade} - {fornecedor.endereco.estado}, {fornecedor.endereco.cep}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Condição de Pagamento Padrão</h3>
                  <p className="text-sm">{fornecedor.condicaoPagamentoPadrao}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Prazo de Entrega (dias)</h3>
                  <p className="text-sm">{fornecedor.prazoEntrega}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Avaliação</h3>
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`w-4 h-4 ${i < fornecedor.avaliacao ? 'text-yellow-400' : 'text-gray-300'}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                    <span className="ml-1 text-sm">{fornecedor.avaliacao}/5</span>
                  </div>
                </div>

                {/* Campo Observações */}
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Observações</h3>
                  <p className="text-sm">{fornecedor.observacoes}</p>
                </div>

              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}