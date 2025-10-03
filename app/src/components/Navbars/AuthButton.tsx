"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Button } from "@/lib/components/ui/button"
import { LogInIcon, LogOutIcon } from "lucide-react"

export default function AuthButton() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }

    getUser()

    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null)
      if (event === "SIGNED_OUT") {
        router.push("/login")
        router.refresh() // Keep refresh for sign-out to clear client-side cache
      } else if (event === "SIGNED_IN") {
        // Removed router.refresh() here to prevent potential loops
        // The middleware handles the initial redirect after login.
        // Subsequent data revalidation can be handled by Next.js's caching.
      }
    })

    return () => {
      authListener?.subscription.unsubscribe()
    }
  }, [router, supabase])

  const handleLogout = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error("Logout error:", error)
      setLoading(false)
    }
    // Redirection handled by onAuthStateChange listener
  }

  if (loading) {
    return null // Or a loading spinner
  }

  return user ? (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium hidden md:block">{user.email}</span>
      <Button variant="ghost" size="icon" onClick={handleLogout} disabled={loading} aria-label="Logout">
        <LogOutIcon className="h-5 w-5" />
      </Button>
    </div>
  ) : (
    <Button variant="ghost" size="icon" onClick={() => router.push("/login")} aria-label="Login">
      <LogInIcon className="h-5 w-5" />
    </Button>
  )
}
