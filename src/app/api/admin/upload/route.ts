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

    // Validate mime type & determine strict extension
    const MIME_EXTENSION_MAP: Record<string, string> = {
      "image/jpeg": ".jpg",
      "image/png": ".png",
      "image/webp": ".webp",
      "image/svg+xml": ".svg",
      "application/pdf": ".pdf",
    };

    const ext = MIME_EXTENSION_MAP[file.type];
    if (!ext) {
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
    let buffer = Buffer.from(bytes);

    // Sanitización activa para archivos SVG contra XSS almacenado
    if (file.type === "image/svg+xml") {
      let svgText = buffer.toString("utf-8");
      // Neutralizar etiquetas script, foreignObject y handlers inline
      svgText = svgText
        .replace(/<script[\s\S]*?<\/script>/gi, "")
        .replace(/<foreignObject[\s\S]*?<\/foreignObject>/gi, "")
        .replace(/on\w+\s*=\s*(["'][^"']*["']|[^\s>]+)/gi, "")
        .replace(/href\s*=\s*["']\s*javascript:[^"']*["']/gi, 'href="#"')
        .replace(/xlink:href\s*=\s*["']\s*javascript:[^"']*["']/gi, 'xlink:href="#"');
      buffer = Buffer.from(svgText, "utf-8");
    }

    // Sanitize filename
    const originalExt = path.extname(file.name);
    const baseName = path
      .basename(file.name, originalExt)
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9_-]/g, "-")
      .replace(/-+/g, "-")
      .slice(0, 80);

    const uniqueName = `${baseName || "file"}-${Date.now()}${ext}`;
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
