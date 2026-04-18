import { NextRequest, NextResponse } from "next/server";
import { getModuleQuiz } from "@/lib/content";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const moduleId = searchParams.get("moduleId");

  if (!moduleId || typeof moduleId !== "string") {
    return NextResponse.json({ error: "moduleId required" }, { status: 400 });
  }

  const quiz = getModuleQuiz(moduleId);
  if (!quiz) {
    return NextResponse.json({ questions: [], passingScore: 80 });
  }

  return NextResponse.json(quiz);
}
