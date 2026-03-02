import { NextRequest, NextResponse } from "next/server";
import { uploadFile } from "@/lib/cloudinary";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const type = formData.get("type") as string; // "model" or "thumbnail"

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const isModel = type === "model";
    const result = await uploadFile(buffer, {
      folder: isModel ? "rzx/models" : "rzx/thumbnails",
      resourceType: isModel ? "raw" : "image",
    });

    return NextResponse.json({
      url: result.url,
      publicId: result.publicId,
      bytes: result.bytes,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
