import { Router, Request, Response } from "express";
import type { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";

const router = Router();

type VariantInput = {
  id?: string;
  flavor: string;
  price: number;
  stock: number;
};

const toNumber = (v: unknown) => {
  if (typeof v === "number") return v;
  if (typeof v === "string" && v.trim() !== "") return Number(v);
  return NaN;
};

const normalizeProductResponse = (p: any) => {
  const variants = Array.isArray(p?.variants) ? p.variants : [];

  const derivedPrice = variants.length > 0
    ? Math.min(...variants.map((v: any) => Number(v.price)))
    : p.price;

  const derivedStock = variants.length > 0
    ? variants.reduce((acc: number, v: any) => acc + Number(v.stock), 0)
    : p.stock;

  return {
    ...p,
    price: derivedPrice,
    stock: derivedStock,
    variants,
  };
};

router.get("/", async (req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
      include: { variants: { orderBy: { createdAt: "asc" } } },
    });

    res.json(products.map(normalizeProductResponse));
  } catch (error) {
    console.error("Erro ao buscar produtos", error);
    res.status(500).json({ message: "Erro ao buscar produtos" });
  }
});

router.get("/:id", async (req: Request, res: Response) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
      include: { variants: { orderBy: { createdAt: "asc" } } },
    });
    if (!product) return res.status(404).json({ message: "Produto não encontrado" });
    res.json(normalizeProductResponse(product));
  } catch (error) {
    console.error("Erro ao buscar produto", error);
    res.status(500).json({ message: "Erro ao buscar produto" });
  }
});

router.post("/", async (req: Request, res: Response) => {
  try {
    const { name, price, stock, variants } = req.body as {
      name: string;
      price?: number;
      stock?: number;
      variants?: VariantInput[];
    };

    if (!name || typeof name !== "string") {
      return res.status(400).json({ message: "Nome do produto é obrigatório" });
    }

    const normalizedVariants: VariantInput[] = Array.isArray(variants)
      ? variants
        .filter((v) => v && typeof v.flavor === "string" && v.flavor.trim() !== "")
        .map((v) => ({
          flavor: v.flavor.trim(),
          price: Number(v.price),
          stock: Number(v.stock),
        }))
      : [];

    const legacyPrice = toNumber(price);
    const legacyStock = toNumber(stock);

    if (normalizedVariants.length === 0) {
      if (!Number.isFinite(legacyPrice) || !Number.isFinite(legacyStock)) {
        return res.status(400).json({ message: "Informe variants ou price/stock" });
      }

      normalizedVariants.push({
        flavor: "Padrão",
        price: legacyPrice,
        stock: legacyStock,
      });
    }

    const product = await prisma.product.create({
      data: {
        name,
        variants: {
          create: normalizedVariants.map((v) => ({
            flavor: v.flavor,
            price: v.price,
            stock: v.stock,
          })),
        },
      },
      include: { variants: { orderBy: { createdAt: "asc" } } },
    });

    res.status(201).json(normalizeProductResponse(product));
  } catch (error) {
    console.error("Erro ao criar produto", error);
    res.status(500).json({ message: "Erro ao criar produto" });
  }
});

router.put("/:id", async (req: Request, res: Response) => {
  try {
    const { name, price, stock, variants } = req.body as {
      name?: string;
      price?: number;
      stock?: number;
      variants?: VariantInput[];
    };

    const productId = req.params.id;

    const normalizedVariants: VariantInput[] = Array.isArray(variants)
      ? variants
        .filter((v) => v && typeof v.flavor === "string" && v.flavor.trim() !== "")
        .map((v) => ({
          id: v.id,
          flavor: v.flavor.trim(),
          price: Number(v.price),
          stock: Number(v.stock),
        }))
      : [];

    const legacyPrice = toNumber(price);
    const legacyStock = toNumber(stock);

    const updated = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const p = await tx.product.update({
        where: { id: productId },
        data: {
          ...(typeof name === "string" ? { name } : {}),
        },
      });

      if (normalizedVariants.length > 0) {
        for (const v of normalizedVariants) {
          if (v.id) {
            await tx.productVariant.update({
              where: { id: v.id },
              data: { flavor: v.flavor, price: v.price, stock: v.stock },
            });
          } else {
            await tx.productVariant.create({
              data: { productId, flavor: v.flavor, price: v.price, stock: v.stock },
            });
          }
        }
      } else if (Number.isFinite(legacyPrice) && Number.isFinite(legacyStock)) {
        const existingDefault = await tx.productVariant.findFirst({
          where: { productId, flavor: "Padrão" },
          orderBy: { createdAt: "asc" },
        });

        if (existingDefault) {
          await tx.productVariant.update({
            where: { id: existingDefault.id },
            data: { price: legacyPrice, stock: legacyStock },
          });
        } else {
          await tx.productVariant.create({
            data: { productId, flavor: "Padrão", price: legacyPrice, stock: legacyStock },
          });
        }
      }

      const reloaded = await tx.product.findUnique({
        where: { id: productId },
        include: { variants: { orderBy: { createdAt: "asc" } } },
      });

      return reloaded;
    });

    if (!updated) return res.status(404).json({ message: "Produto não encontrado" });
    res.json(normalizeProductResponse(updated));
  } catch (error) {
    console.error("Erro ao atualizar produto", error);
    res.status(500).json({ message: "Erro ao atualizar produto" });
  }
});

export default router;
