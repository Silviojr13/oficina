import { NextResponse } from 'next/server';
import { carrinhoMock, produtos } from '@/lib/mock-data'; // Importing both carrinhoMock and produtos

// Simple in-memory storage simulation for the cart
// In a real application, this would be a database or a persistent cache
let serverSideCart = [...carrinhoMock];

export async function POST(request: Request) {
  try {
    const { produtoId } = await request.json();

    // Find the product by ID
    const produto = produtos.find(p => p.id === produtoId);

    if (!produto) {
      return NextResponse.json({ error: 'Produto não encontrado.' }, { status: 404 });
    }

    // Check if the product is already in the cart
    const existingItemIndex = serverSideCart.findIndex(item => item.produto.id === produtoId);

    if (existingItemIndex >= 0) {
      // If it exists, increment the quantity
      serverSideCart[existingItemIndex].quantidade += 1;
    } else {
      // If it doesn't exist, add it as a new item with quantity 1
      serverSideCart.push({ produto, quantidade: 1 });
    }

    // Calculate the new total
    const total = serverSideCart.reduce((acc, item) => acc + (item.produto.precoSite * item.quantidade), 0);

    return NextResponse.json({
      success: true,
      produtos: serverSideCart,
      total
    });

  } catch (error) {
    console.error("Erro no endpoint /api/carrinho/adicionar:", error);
    return NextResponse.json({ error: 'Erro interno do servidor.' }, { status: 500 });
  }
}

// Optional: Endpoint to reset the cart for demonstration purposes
export async function GET() {
  serverSideCart = [...carrinhoMock]; // Reset to initial mock state
  return NextResponse.json({ message: 'Carrinho resetado para estado inicial.', produtos: serverSideCart });
}