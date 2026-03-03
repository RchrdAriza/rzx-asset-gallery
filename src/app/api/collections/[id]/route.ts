import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const collection = await prisma.collection.findUnique({
    where: { id },
    include: { assets: { include: { category: true, tags: true } } },
  });
  if (!collection) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(collection);
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, description, coverUrl, assetIds } = body;

    const data: Record<string, unknown> = {};
    if (name !== undefined) {
      data.name = name;
      data.slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
    }
    if (description !== undefined) data.description = description;
    if (coverUrl !== undefined) data.coverUrl = coverUrl;
    if (assetIds !== undefined) {
      data.assets = { set: assetIds.map((aid: string) => ({ id: aid })) };
    }

    const collection = await prisma.collection.update({
      where: { id },
      data,
      include: { assets: { include: { category: true, tags: true } } },
    });
    return NextResponse.json(collection);
  } catch (error) {
    console.error("Error updating collection:", error);
    return NextResponse.json({ error: "Failed to update collection" }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.collection.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting collection:", error);
    return NextResponse.json({ error: "Failed to delete collection" }, { status: 500 });
  }
}
