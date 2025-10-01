import { NextResponse } from "next/server"

export async function GET() {
  const baseUrl = process.env.BLOG_BASE_URL
  const token = process.env.ADMIN_REVALIDATE_TOKEN

  if (!baseUrl) {
    return NextResponse.json({ error: "Missing BLOG_BASE_URL env" }, { status: 500 })
  }

  const res = await fetch(`${baseUrl}/api/cache`, {
    // optionally enforce token on blog by adding ?enforce=1
    method: "GET",
    headers: token ? { "x-revalidate-token": token } : {},
    cache: "no-store",
    next: { revalidate: 0 },
  })

  if (!res.ok) {
    const text = await res.text()
    return NextResponse.json({ error: text || "Upstream error" }, { status: res.status })
  }

  const data = await res.json()
  return NextResponse.json({ availableTags: data.availableTags || [] })
}
