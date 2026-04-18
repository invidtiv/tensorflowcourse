import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

interface ModuleMeta {
  id: string;
  number: number;
  title: string;
  shortTitle: string;
  color: string;
  icon: string;
  keyTakeaways?: string[];
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const moduleId = searchParams.get("moduleId");

  const contentDir = path.join(process.cwd(), "content", "modules");

  // Return all modules if no moduleId specified
  if (!moduleId) {
    const dirs = fs
      .readdirSync(contentDir)
      .filter((n) => fs.statSync(path.join(contentDir, n)).isDirectory())
      .sort();

    const metas: ModuleMeta[] = [];
    for (const dir of dirs) {
      const metaPath = path.join(contentDir, dir, "_meta.json");
      if (fs.existsSync(metaPath)) {
        try {
          const raw = fs.readFileSync(metaPath, "utf-8");
          metas.push(JSON.parse(raw) as ModuleMeta);
        } catch {
          // skip malformed files
        }
      }
    }
    return NextResponse.json(metas);
  }

  const metaPath = path.join(contentDir, moduleId, "_meta.json");
  if (!fs.existsSync(metaPath)) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  try {
    const raw = fs.readFileSync(metaPath, "utf-8");
    return NextResponse.json(JSON.parse(raw));
  } catch {
    return NextResponse.json({ error: "parse error" }, { status: 500 });
  }
}
