import { NextResponse } from "next/server";
import { runVectorizationPipeline } from "@/lib/vector-engine";
import type { AnalysisMode } from "@/types";

/**
 * Vectorization API endpoint.
 *
 * Demo mode runs the in-process pipeline (simulated CV milestones + structured SVG layers).
 * Point VECTOR_SERVICE_URL at a Python OpenCV/Potrace microservice for production inference.
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      modes?: AnalysisMode[];
      projectName?: string;
    };

    const modes = body.modes?.length ? body.modes : (["geometry"] as AnalysisMode[]);
    const serviceUrl = process.env.VECTOR_SERVICE_URL;

    if (serviceUrl) {
      const upstream = await fetch(`${serviceUrl}/vectorize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!upstream.ok) {
        return NextResponse.json(
          { error: "Upstream vector service failed" },
          { status: 502 }
        );
      }

      const data = await upstream.json();
      return NextResponse.json(data);
    }

    const result = await runVectorizationPipeline({ modes });

    return NextResponse.json({
      success: true,
      projectName: body.projectName ?? "Untitled Cleat Scan",
      ...result,
    });
  } catch (error) {
    console.error("Vectorize error:", error);
    return NextResponse.json({ error: "Failed to vectorize image" }, { status: 500 });
  }
}
