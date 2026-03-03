import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const collections = await prisma.collection.findMany({
      include: { assets: { include: { category: true, tags: true } } },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(collections);
  } catch (error) {
    console.error("Error fetching collections:", error);
    return NextResponse.json({ error: "Failed to fetch collections" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, coverUrl, assetIds } = body;

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const collection = await prisma.collection.create({
      data: {
        name,
        slug,
        description,
        coverUrl: coverUrl || "",
        assets: { connect: (assetIds || []).map((id: string) => ({ id })) },
      },
      include: { assets: { include: { category: true, tags: true } } },
    });

    return NextResponse.json(collection, { status: 201 });
  } catch (error) {
    console.error("Error creating collection:", error);
    return NextResponse.json({ error: "Failed to create collection" }, { status: 500 });
  }
}
