// Listas de referência (taxonomia) do catálogo de autopeças.
// Diferente de produtos/fornecedores/etc, isso não é um registro de negócio
// que muda por CRUD — é uma lista de apoio para formulários e filtros.

export const categorias = [
  { id: 'motor', nome: 'Motor', subcategorias: ['Pistões', 'Anéis', 'Bronzinas', 'Juntas', 'Coxins', 'Válvulas'] },
  { id: 'freios', nome: 'Freios', subcategorias: ['Pastilhas', 'Discos', 'Tambores', 'Lonas', 'Cilindros', 'Flexíveis'] },
  { id: 'suspensao', nome: 'Suspensão', subcategorias: ['Amortecedores', 'Molas', 'Pivôs', 'Buchas', 'Bandejas', 'Bieletas'] },
  { id: 'transmissao', nome: 'Transmissão', subcategorias: ['Kits Embreagem', 'Rolamentos', 'Câmbio', 'Juntas Homocinéticas'] },
  { id: 'eletrica', nome: 'Elétrica', subcategorias: ['Velas de Ignição', 'Sensores', 'Baterias', 'Alternadores', 'Motores de Partida', 'Bobinas'] },
  { id: 'filtros', nome: 'Filtros', subcategorias: ['Filtro de Óleo', 'Filtro de Ar', 'Filtro de Combustível', 'Filtro de Ar Condicionado'] },
  { id: 'correia', nome: 'Correia e Corrente', subcategorias: ['Correias Dentadas', 'Correias Poly-V', 'Kits de Correia', 'Correntes de Comando'] },
  { id: 'arrefecimento', nome: 'Arrefecimento', subcategorias: ['Radiadores', 'Bombas de Água', 'Válvulas Termostáticas', 'Mangueiras', 'Ventoinhas'] },
  { id: 'combustivel', nome: 'Combustível', subcategorias: ['Bicos Injetores', 'Bombas de Combustível', 'Filtros', 'Reguladores de Pressão'] },
  { id: 'escapamento', nome: 'Escapamento', subcategorias: ['Catalisadores', 'Silenciosos', 'Flexíveis', 'Abraçadeiras'] },
  { id: 'carroceria', nome: 'Carroceria', subcategorias: ['Para-choques', 'Capôs', 'Para-lamas', 'Retrovisores'] },
  { id: 'acessorios', nome: 'Acessórios', subcategorias: ['Limpadores', 'Tapetes', 'Capas', 'Organizadores'] },
  { id: 'embreagem', nome: 'Embreagem', subcategorias: ['Kit Completo', 'Platôs', 'Discos', 'Rolamentos'] },
  { id: 'direcao', nome: 'Direção', subcategorias: ['Terminais', 'Barras', 'Caixas', 'Bombas'] },
  { id: 'iluminacao', nome: 'Iluminação', subcategorias: ['Faróis', 'Lanternas', 'Lâmpadas', 'LEDs'] },
  { id: 'lubrificantes', nome: 'Lubrificantes', subcategorias: ['Óleos de Motor', 'Óleos de Câmbio', 'Fluidos de Freio', 'Aditivos'] },
];

export const marcas = [
  'Bosch', 'NGK', 'Cofap', 'Mahle', 'Monroe', 'Gates', 'Sachs', 'TRW',
  'Fremax', 'Mann Filter', 'Indisa', 'Nakata', 'Moura', 'Visconde',
  'Sampel', 'Victor Reinz', 'Fitam', 'Mobil', 'Shell', 'Castrol',
];

export const montadoras = [
  { nome: 'Fiat', modelos: ['Uno', 'Palio', 'Siena', 'Strada', 'Toro', 'Mobi', 'Argo', 'Cronos'] },
  { nome: 'Volkswagen', modelos: ['Gol', 'Fox', 'Polo', 'Virtus', 'Golf', 'Jetta', 'T-Cross', 'Nivus'] },
  { nome: 'Chevrolet', modelos: ['Onix', 'Prisma', 'Cruze', 'Tracker', 'S10', 'Trailblazer', 'Spin', 'Cobalt'] },
  { nome: 'Ford', modelos: ['Ka', 'Ecosport', 'Ranger', 'Fiesta', 'Focus', 'Fusion', 'Territory'] },
  { nome: 'Honda', modelos: ['Civic', 'City', 'Fit', 'HR-V', 'CR-V', 'WR-V', 'Accord'] },
  { nome: 'Toyota', modelos: ['Corolla', 'Yaris', 'Hilux', 'SW4', 'Etios', 'RAV4', 'Camry'] },
  { nome: 'Hyundai', modelos: ['HB20', 'HB20S', 'Creta', 'Tucson', 'Santa Fe', 'i30', 'Azera'] },
  { nome: 'Renault', modelos: ['Sandero', 'Logan', 'Kwid', 'Duster', 'Captur', 'Oroch', 'Master'] },
  { nome: 'Nissan', modelos: ['March', 'Versa', 'Sentra', 'Kicks', 'Frontier', 'Leaf'] },
  { nome: 'Jeep', modelos: ['Renegade', 'Compass', 'Commander', 'Wrangler', 'Gladiator'] },
  { nome: 'Audi', modelos: ['A3', 'A4', 'A5', 'Q3', 'Q5', 'Q7', 'TT'] },
  { nome: 'BMW', modelos: ['Série 1', 'Série 3', 'Série 5', 'X1', 'X3', 'X5', 'X6'] },
  { nome: 'Mercedes-Benz', modelos: ['Classe A', 'Classe C', 'Classe E', 'GLA', 'GLC', 'GLE'] },
];
