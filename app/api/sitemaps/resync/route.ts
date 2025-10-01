import { NextResponse } from "next/server"

export async function POST() {
  const baseUrl = process.env.BLOG_BASE_URL
  const token = process.env.ADMIN_REVALIDATE_TOKEN

  if (!baseUrl || !token) {
    return NextResponse.json(
      { error: "Missing BLOG_BASE_URL or ADMIN_REVALIDATE_TOKEN env" },
      { status: 500 },
    )
  }

  const res = await fetch(`${baseUrl}/api/revalidate-sitemaps`, {
    method: "POST",
    headers: {
      "x-revalidate-token": token,
    },
  })

  if (!res.ok) {
    const text = await res.text()
    return NextResponse.json({ error: text || "Upstream error" }, { status: res.status })
  }

  const data = await res.json().catch(() => ({}))
  return NextResponse.json({ ok: true, ...data })
}
