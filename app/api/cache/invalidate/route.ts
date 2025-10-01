import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const baseUrl = process.env.BLOG_BASE_URL
  const token = process.env.ADMIN_REVALIDATE_TOKEN

  if (!baseUrl) {
    return NextResponse.json({ error: "Missing BLOG_BASE_URL env" }, { status: 500 })
  }

  const { tag } = await request.json().catch(() => ({}))
  if (!tag) {
    return NextResponse.json({ error: "Missing 'tag' in body" }, { status: 400 })
  }

  const res = await fetch(`${baseUrl}/api/cache?tag=${encodeURIComponent(tag)}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(token ? { "x-revalidate-token": token } : {}),
    },
  })

  if (!res.ok) {
    const text = await res.text()
    return NextResponse.json({ error: text || "Upstream error" }, { status: res.status })
  }

  const data = await res.json().catch(() => ({}))
  return NextResponse.json({ ok: true, ...data })
}
