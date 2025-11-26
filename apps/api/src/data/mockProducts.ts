export interface Product {
  id: string;
  nome: string;
  categoria: string;
  preco: number;
  unidade: string;
}

export const mockProducts: Product[] = [
  { id: "1", nome: "Brigadeiro Gourmet", categoria: "Doces", preco: 3.5, unidade: "unidade" },
  { id: "2", nome: "Coxinha", categoria: "Salgados", preco: 6.0, unidade: "unidade" }
];
