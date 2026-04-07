"use client"

import { Shield, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface LoginAuthCardProps {
  email: string
  setEmail: (value: string) => void
  password: string
  setPassword: (value: string) => void
  isRegister: boolean
  error: string | null
  isLoading: boolean
  onSubmit: (e: React.FormEvent) => void
  onToggleRegister: () => void
}

export function LoginAuthCard({
  email,
  setEmail,
  password,
  setPassword,
  isRegister,
  error,
  isLoading,
  onSubmit,
  onToggleRegister,
}: LoginAuthCardProps) {
  return (
    <Card className="w-full max-w-md bg-card/80 border-border backdrop-blur-xl shadow-2xl shadow-emerald-500/5 relative z-10">
      <CardHeader className="text-center pb-2">
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="relative">
            <div className="absolute inset-0 bg-emerald-500 rounded-xl blur-xl opacity-50 animate-pulse" />
            <div className="relative bg-gradient-to-br from-emerald-400 to-emerald-600 p-3 rounded-xl">
              <Shield className="w-8 h-8 text-white" />
            </div>
          </div>
          <div className="flex flex-col items-start">
            <span className="text-2xl font-bold tracking-tight text-foreground">VINGUARD</span>
            <span className="text-[10px] tracking-[0.3em] text-emerald-600 uppercase">Security Protocol</span>
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
        <form onSubmit={onSubmit} className="space-y-4">
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
              className="bg-secondary border-border focus:border-emerald-500/50 focus:ring-emerald-500/20"
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
              className="bg-secondary border-border focus:border-emerald-500/50 focus:ring-emerald-500/20"
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
            onClick={onToggleRegister}
            className="text-sm text-muted-foreground hover:text-emerald-400 transition-colors"
          >
            {isRegister
              ? "Already have an account? Sign in"
              : "Don't have an account? Sign up"
            }
          </button>
        </div>

        <p className="text-center text-xs text-muted-foreground leading-relaxed">
          Your data is encrypted and secure. We never share your information.
        </p>
      </CardContent>
    </Card>
  )
}
