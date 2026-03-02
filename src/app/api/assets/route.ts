import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const tag = searchParams.get("tag");
  const search = searchParams.get("search");
  const featured = searchParams.get("featured");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "12");

  const where: Record<string, unknown> = {};

  if (category) {
    where.category = { slug: category };
  }

  if (tag) {
    where.tags = { some: { name: tag } };
  }

  if (search) {
    where.OR = [
      { name: { contains: search } },
      { description: { contains: search } },
    ];
  }

  if (featured === "true") {
    where.featured = true;
  }

  const [assets, total] = await Promise.all([
    prisma.asset.findMany({
      where,
      include: { category: true, tags: true },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.asset.count({ where }),
  ]);

  return NextResponse.json({
    assets,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, categoryId, tags, modelUrl, thumbnailUrl, format, fileSize, featured } = body;

    const asset = await prisma.asset.create({
      data: {
        name,
        description,
        categoryId,
        modelUrl,
        thumbnailUrl,
        format,
        fileSize,
        featured: featured || false,
        tags: {
          connectOrCreate: (tags || []).map((tag: string) => ({
            where: { name: tag },
            create: { name: tag },
          })),
        },
      },
      include: { category: true, tags: true },
    });

    return NextResponse.json(asset, { status: 201 });
  } catch (error) {
    console.error("Error creating asset:", error);
    return NextResponse.json({ error: "Failed to create asset" }, { status: 500 });
  }
}
