import { NextResponse } from "next/server";

/**
 * Optional upstream CV microservice proxy.
 *
 * Browser tracing (ImageTracer) is the default path in the Studio.
 * Set VECTOR_SERVICE_URL to route server-side jobs to a Python OpenCV/Potrace service.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const serviceUrl = process.env.VECTOR_SERVICE_URL;

    if (!serviceUrl) {
      return NextResponse.json(
        {
          error:
            "No VECTOR_SERVICE_URL configured. The Studio traces images in the browser by default.",
          clientTracing: true,
        },
        { status: 501 }
      );
    }

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
  } catch (error) {
    console.error("Vectorize error:", error);
    return NextResponse.json({ error: "Failed to vectorize image" }, { status: 500 });
  }
}
