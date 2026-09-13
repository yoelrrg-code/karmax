import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/adminGuard";
import fs from "node:fs/promises";
import path from "node:path";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const auth = await requireAdminApi();
  if (auth.response) return auth.response;

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "products";

    if (!file) {
      return NextResponse.json({ error: "No se proporcionó ningún archivo" }, { status: 400 });
    }

    // Validate mime type
    const validMimes = ["image/jpeg", "image/png", "image/webp", "image/svg+xml", "application/pdf"];
    if (!validMimes.includes(file.type)) {
      return NextResponse.json(
        { error: "Tipo de archivo no permitido. Solo imágenes (JPG, PNG, WEBP, SVG) o PDF." },
        { status: 400 }
      );
    }

    // Maximum file size: 10MB
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "El archivo excede el tamaño máximo permitido (10MB)" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Sanitize filename
    const ext = path.extname(file.name) || ".jpg";
    const baseName = path
      .basename(file.name, ext)
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9_-]/g, "-")
      .replace(/-+/g, "-");

    const uniqueName = `${baseName}-${Date.now()}${ext}`;
    const targetSubfolder = folder === "brands" ? "brands" : folder === "products" ? "products" : "uploads";
    const targetDir = path.join(process.cwd(), "public", "images", targetSubfolder);

    await fs.mkdir(targetDir, { recursive: true });
    const targetFilePath = path.join(targetDir, uniqueName);
    await fs.writeFile(targetFilePath, buffer);

    const relativeUrl = `/images/${targetSubfolder}/${uniqueName}`;

    return NextResponse.json({
      success: true,
      url: relativeUrl,
      fileName: uniqueName,
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      { error: "Error interno al procesar la subida del archivo" },
      { status: 500 }
    );
  }
}
