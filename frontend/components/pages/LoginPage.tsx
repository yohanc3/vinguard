"use client"

import { useState } from "react"
import { Shield, Lock } from "lucide-react"
import { useTRPC } from "@/lib/trpc"
import { useMutation } from "@tanstack/react-query"
import { LoginPageAmbient } from "@/components/pages/login-page-ambient"
import { LoginAuthCard } from "@/components/pages/login-auth-card"

interface LoginPageProps {
  onLogin: () => void
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const trpc = useTRPC()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isRegister, setIsRegister] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loginMutation = useMutation(trpc.auth.login.mutationOptions())
  const registerMutation = useMutation(trpc.auth.register.mutationOptions())

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!email.trim() || !password.trim()) {
      setError("Please enter both email and password")
      return
    }

    try {
      if (isRegister) {
        const result = await registerMutation.mutateAsync({ email, password })
        localStorage.setItem("token", result.token)
        onLogin()
      } else {
        const result = await loginMutation.mutateAsync({ email, password })
        localStorage.setItem("token", result.token)
        onLogin()
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Authentication failed"
      setError(message)
    }
  }

  const isLoading = loginMutation.isPending || registerMutation.isPending

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <LoginPageAmbient />

      <LoginAuthCard
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        isRegister={isRegister}
        error={error}
        isLoading={isLoading}
        onSubmit={handleSubmit}
        onToggleRegister={function onToggleRegister() {
          setIsRegister(!isRegister)
          setError(null)
        }}
      />

      <div className="flex items-center gap-6 mt-8 text-muted-foreground">
        <div className="flex items-center gap-2 text-xs">
          <Lock className="w-3 h-3" />
          <span>Encrypted</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <Shield className="w-3 h-3" />
          <span>Secure</span>
        </div>
      </div>
    </div>
  )
}
