import { NextResponse } from "next/server";

export function errorJson(status: number, error: string, detalle?: string) {
  return NextResponse.json({ error, detalle }, { status });
}