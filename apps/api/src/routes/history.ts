import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { parseDateSafe } from "../utils/dateUtils";

const router = Router();

// Estatísticas gerais
router.get("/stats", async (req: Request, res: Response) => {
  try {
    const { month, productId } = req.query;
    
    // Filtros de data
    let dateFilter: any = {};
    if (month && month !== 'todos') {
      const year = new Date().getFullYear();
      const monthMap: { [key: string]: number } = {
        'Janeiro': 0, 'Fevereiro': 1, 'Março': 2, 'Abril': 3, 'Maio': 4,
        'Junho': 5, 'Julho': 6, 'Agosto': 7, 'Setembro': 8, 'Outubro': 9, 'Novembro': 10, 'Dezembro': 11
      };
      const monthNum = monthMap[month as string];
      if (monthNum !== undefined) {
        dateFilter = {
          gte: new Date(year, monthNum, 1),
          lt: new Date(year, monthNum + 1, 1)
        };
      }
    }

    // Buscar encomendas
    const ordersWhere: any = {
      createdAt: dateFilter
    };
    if (productId && productId !== 'todos') {
      ordersWhere.items = {
        some: { productId }
      };
    }

    const orders = await prisma.order.findMany({
      where: ordersWhere,
      include: {
        items: {
          include: { product: true }
        }
      }
    });

    // Buscar vendas rápidas
    const quickSalesWhere: any = {
      createdAt: dateFilter
    };
    if (productId && productId !== 'todos') {
      quickSalesWhere.items = {
        some: { productId }
      };
    }

    const quickSales = await prisma.quickSale.findMany({
      where: quickSalesWhere,
      include: {
        items: {
          include: { product: true }
        }
      }
    });

    // Calcular totais
    const totalOrders = orders.reduce((acc: number, order: any) => acc + order.total, 0);
    const totalQuickSales = quickSales.reduce((acc: number, sale: any) => acc + sale.total, 0);
    const totalGeneral = totalOrders + totalQuickSales;
    
    const ticketMedio = orders.length > 0 ? totalOrders / orders.length : 0;

    // Calcular crescimento (comparando com mês anterior)
    let crescimento = 0;
    if (month && month !== 'todos') {
      const year = new Date().getFullYear();
      const monthMap: { [key: string]: number } = {
        'Janeiro': 0, 'Fevereiro': 1, 'Março': 2, 'Abril': 3, 'Maio': 4, 'Junho': 5,
        'Julho': 6, 'Agosto': 7, 'Setembro': 8, 'Outubro': 9, 'Novembro': 10, 'Dezembro': 11
      };
      const monthNum = monthMap[month as string];
      
      if (monthNum !== undefined && monthNum > 0) {
        // Mês atual
        const currentMonthStart = new Date(year, monthNum, 1, 12, 0, 0);
        const currentMonthEnd = new Date(year, monthNum + 1, 1, 12, 0, 0);
        
        // Mês anterior
        const previousMonthStart = new Date(year, monthNum - 1, 1, 12, 0, 0);
        const previousMonthEnd = new Date(year, monthNum, 1, 12, 0, 0);
        
        const currentOrders = await prisma.order.findMany({
          where: {
            createdAt: { gte: currentMonthStart, lt: currentMonthEnd },
            ...(productId && productId !== 'todos' && {
              items: { some: { productId: productId as string } }
            })
          }
        });
        
        const previousOrders = await prisma.order.findMany({
          where: {
            createdAt: { gte: previousMonthStart, lt: previousMonthEnd },
            ...(productId && productId !== 'todos' && {
              items: { some: { productId: productId as string } }
            })
          }
        });
        
        const currentQuickSales = await prisma.quickSale.findMany({
          where: {
            createdAt: { gte: currentMonthStart, lt: currentMonthEnd },
            ...(productId && productId !== 'todos' && {
              items: { some: { productId: productId as string } }
            })
          }
        });
        
        const previousQuickSales = await prisma.quickSale.findMany({
          where: {
            createdAt: { gte: previousMonthStart, lt: previousMonthEnd },
            ...(productId && productId !== 'todos' && {
              items: { some: { productId: productId as string } }
            })
          }
        });
        
        const currentTotal = currentOrders.reduce((acc: number, o: any) => acc + o.total, 0) + 
                           currentQuickSales.reduce((acc: number, s: any) => acc + s.total, 0);
        const previousTotal = previousOrders.reduce((acc: number, o: any) => acc + o.total, 0) + 
                             previousQuickSales.reduce((acc: number, s: any) => acc + s.total, 0);
        
        if (previousTotal > 0) {
          crescimento = ((currentTotal - previousTotal) / previousTotal) * 100;
        }
      }
    }

    res.json({
      totalVendas: totalGeneral,
      totalEncomendas: totalOrders,
      totalVendasRapidas: totalQuickSales,
      quantidadeEncomendas: orders.length,
      ticketMedio,
      crescimento
    });
  } catch (error) {
    console.error("Erro ao buscar estatísticas:", error);
    res.status(500).json({ message: "Erro ao buscar estatísticas" });
  }
});

// Vendas por mês para o gráfico
router.get("/sales-by-month", async (req: Request, res: Response) => {
  try {
    const { productId } = req.query;
    
    // Buscar dados dos últimos 6 meses
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const ordersWhere: any = {
      createdAt: { gte: sixMonthsAgo }
    };
    const quickSalesWhere: any = {
      createdAt: { gte: sixMonthsAgo }
    };
    
    if (productId && productId !== 'todos') {
      ordersWhere.items = { some: { productId } };
      quickSalesWhere.items = { some: { productId } };
    }

    const orders = await prisma.order.findMany({
      where: ordersWhere,
      select: { total: true, createdAt: true }
    });

    const quickSales = await prisma.quickSale.findMany({
      where: quickSalesWhere,
      select: { total: true, createdAt: true }
    });

    // Agrupar vendas por mês
    const salesByMonth: { [key: string]: number } = {};
    const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    
    // Inicializar últimos 6 meses
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthKey = monthNames[date.getMonth()];
      salesByMonth[monthKey] = 0;
    }
    
    // Somar vendas de encomendas
    orders.forEach((order: any) => {
      const monthKey = monthNames[order.createdAt.getMonth()];
      if (salesByMonth[monthKey] !== undefined) {
        salesByMonth[monthKey] += order.total;
      }
    });
    
    // Somar vendas rápidas
    quickSales.forEach((sale: any) => {
      const monthKey = monthNames[sale.createdAt.getMonth()];
      if (salesByMonth[monthKey] !== undefined) {
        salesByMonth[monthKey] += sale.total;
      }
    });

    const chartData = Object.entries(salesByMonth).map(([mes, vendas]) => ({
      mes,
      vendas
    }));

    res.json(chartData);
  } catch (error) {
    console.error("Erro ao buscar vendas por mês:", error);
    res.status(500).json({ message: "Erro ao buscar vendas por mês" });
  }
});

// Produtos mais vendidos
router.get("/top-products", async (req: Request, res: Response) => {
  try {
    const { month, productId } = req.query;
    
    // Filtros de data
    let dateFilter: any = {};
    if (month && month !== 'todos') {
      const year = new Date().getFullYear();
      const monthMap: { [key: string]: number } = {
        'Janeiro': 0, 'Fevereiro': 1, 'Março': 2, 'Abril': 3, 'Maio': 4, 'Junho': 5,
        'Julho': 6, 'Agosto': 7, 'Setembro': 8, 'Outubro': 9, 'Novembro': 10, 'Dezembro': 11
      };
      const monthNum = monthMap[month as string];
      if (monthNum !== undefined) {
        dateFilter = {
          gte: new Date(year, monthNum, 1),
          lt: new Date(year, monthNum + 1, 1)
        };
      }
    }

    // Buscar itens de encomendas
    const orderItemsWhere: any = {
      order: { createdAt: dateFilter }
    };
    if (productId && productId !== 'todos') {
      orderItemsWhere.productId = productId;
    }

    const orderItems = await prisma.orderItem.findMany({
      where: orderItemsWhere,
      include: { product: true }
    });

    // Buscar itens de vendas rápidas
    const quickSaleItemsWhere: any = {
      quickSale: { createdAt: dateFilter }
    };
    if (productId && productId !== 'todos') {
      quickSaleItemsWhere.productId = productId;
    }

    const quickSaleItems = await prisma.quickSaleItem.findMany({
      where: quickSaleItemsWhere,
      include: { product: true }
    });

    // Agrupar vendas por produto
    const productsMap: { [key: string]: { id: string; nome: string; quantidade: number; total: number } } = {};
    
    // Processar itens de encomendas
    orderItems.forEach((item: any) => {
      const key = item.productId;
      if (productsMap[key]) {
        productsMap[key].quantidade += item.quantity;
        productsMap[key].total += item.quantity * item.price;
      } else {
        productsMap[key] = {
          id: item.productId,
          nome: item.product.name,
          quantidade: item.quantity,
          total: item.quantity * item.price
        };
      }
    });
    
    // Processar itens de vendas rápidas
    quickSaleItems.forEach((item: any) => {
      const key = item.productId;
      if (productsMap[key]) {
        productsMap[key].quantidade += item.quantity;
        productsMap[key].total += item.quantity * item.price;
      } else {
        productsMap[key] = {
          id: item.productId,
          nome: item.product.name,
          quantidade: item.quantity,
          total: item.quantity * item.price
        };
      }
    });

    const topProducts = Object.values(productsMap)
      .sort((a, b) => b.quantidade - a.quantidade);

    res.json(topProducts);
  } catch (error) {
    console.error("Erro ao buscar produtos mais vendidos:", error);
    res.status(500).json({ message: "Erro ao buscar produtos mais vendidos" });
  }
});

export default router;