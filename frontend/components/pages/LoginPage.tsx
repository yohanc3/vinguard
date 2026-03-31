"use client"

import { useState } from "react"
import { Shield, Lock, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useTRPC } from "@/lib/trpc"
import { useMutation } from "@tanstack/react-query"

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
      {/* Animated background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#27272a_1px,transparent_1px),linear-gradient(to_bottom,#27272a_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20" />
      
      {/* Radial gradient overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent" />

      {/* Floating security icons */}
      <div className="absolute top-20 left-20 text-emerald-500/20 animate-pulse">
        <Shield className="w-24 h-24" />
      </div>
      <div className="absolute bottom-20 right-20 text-emerald-500/20 animate-pulse delay-500">
        <Lock className="w-20 h-20" />
      </div>

      {/* Main Login Card */}
      <Card className="w-full max-w-md bg-card/80 border-zinc-700/50 backdrop-blur-xl shadow-2xl shadow-emerald-500/5 relative z-10">
        <CardHeader className="text-center pb-2">
          {/* Logo */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-emerald-500 rounded-xl blur-xl opacity-50 animate-pulse" />
              <div className="relative bg-gradient-to-br from-emerald-400 to-emerald-600 p-3 rounded-xl">
                <Shield className="w-8 h-8 text-zinc-900" />
              </div>
            </div>
            <div className="flex flex-col items-start">
              <span className="text-2xl font-bold tracking-tight text-foreground">VINGUARD</span>
              <span className="text-[10px] tracking-[0.3em] text-emerald-400 uppercase">Security Protocol</span>
            </div>
          </div>

          <CardTitle className="text-xl text-foreground">
            {isRegister ? "Create Your Account" : "Welcome Back"}
          </CardTitle>
          <CardDescription className="text-muted-foreground mt-2">
            {isRegister 
              ? "Sign up to start checking vehicle histories" 
              : "Sign in to access your vehicle reports"
            }
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 pt-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-secondary border-zinc-700 focus:border-emerald-500/50 focus:ring-emerald-500/20"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-secondary border-zinc-700 focus:border-emerald-500/50 focus:ring-emerald-500/20"
                disabled={isLoading}
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition-all duration-300"
            >
              {isLoading ? (
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>{isRegister ? "Creating Account..." : "Signing In..."}</span>
                </div>
              ) : (
                <span>{isRegister ? "Create Account" : "Sign In"}</span>
              )}
            </Button>
          </form>

          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setIsRegister(!isRegister)
                setError(null)
              }}
              className="text-sm text-muted-foreground hover:text-emerald-400 transition-colors"
            >
              {isRegister 
                ? "Already have an account? Sign in" 
                : "Don't have an account? Sign up"
              }
            </button>
          </div>

          {/* Security notice */}
          <p className="text-center text-xs text-muted-foreground leading-relaxed">
            Your data is encrypted and secure. We never share your information.
          </p>
        </CardContent>
      </Card>

      {/* Footer badges */}
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
