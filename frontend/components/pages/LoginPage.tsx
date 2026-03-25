"use client"

import { useState } from "react"
import { Shield, Car, Lock, ChevronRight, Fingerprint, Eye } from "lucide-react"
import { Button } from "#/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "#/components/ui/card"

interface LoginPageProps {
  onLogin: () => void
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [showSecurityPulse, setShowSecurityPulse] = useState(true)

  function handleGoogleLogin() {
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      onLogin()
    }, 1500)
  }

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
      <div className="absolute top-40 right-32 text-zinc-500/20 animate-pulse delay-1000">
        <Eye className="w-16 h-16" />
      </div>

      {/* Main Login Card */}
      <Card className="w-full max-w-md bg-card/80 border-zinc-700/50 backdrop-blur-xl shadow-2xl shadow-emerald-500/5 relative z-10">
        <CardHeader className="text-center pb-2">
          {/* Logo */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="relative">
              <div className={`absolute inset-0 bg-emerald-500 rounded-xl blur-xl opacity-50 ${showSecurityPulse ? 'animate-pulse' : ''}`} />
              <div className="relative bg-gradient-to-br from-emerald-400 to-emerald-600 p-3 rounded-xl">
                <Shield className="w-8 h-8 text-zinc-900" />
              </div>
            </div>
            <div className="flex flex-col items-start">
              <span className="text-2xl font-bold tracking-tight text-foreground">VINGUARD</span>
              <span className="text-[10px] tracking-[0.3em] text-emerald-400 uppercase">Security Protocol</span>
            </div>
          </div>

          <CardTitle className="text-xl text-foreground">Professional Grade Vehicle Vetting</CardTitle>
          <CardDescription className="text-muted-foreground mt-2">
            Enterprise-level fraud detection for serious buyers
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 pt-4">
          {/* Trust indicators */}
          <div className="flex items-center justify-center gap-6 py-4 border-y border-zinc-700/50">
            <div className="flex flex-col items-center gap-1">
              <span className="text-2xl font-bold font-mono text-emerald-400">2.4M+</span>
              <span className="text-xs text-muted-foreground">VINs Scanned</span>
            </div>
            <div className="w-px h-10 bg-zinc-700" />
            <div className="flex flex-col items-center gap-1">
              <span className="text-2xl font-bold font-mono text-emerald-400">$847M</span>
              <span className="text-xs text-muted-foreground">Fraud Prevented</span>
            </div>
            <div className="w-px h-10 bg-zinc-700" />
            <div className="flex flex-col items-center gap-1">
              <span className="text-2xl font-bold font-mono text-emerald-400">99.7%</span>
              <span className="text-xs text-muted-foreground">Accuracy</span>
            </div>
          </div>

          {/* Google Login Button */}
          <Button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full h-14 bg-secondary hover:bg-zinc-700 border border-zinc-600 text-foreground font-medium transition-all duration-300 hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/10 group"
          >
            {isLoading ? (
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                <span>Authenticating...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-3">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span>Continue with Google</span>
                <ChevronRight className="w-4 h-4 ml-auto opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </div>
            )}
          </Button>

          {/* Alternative auth hint */}
          <div className="flex items-center gap-3 px-4 py-3 bg-secondary/50 rounded-lg border border-zinc-700/50">
            <Fingerprint className="w-5 h-5 text-emerald-400" />
            <div className="text-sm">
              <span className="text-muted-foreground">Enterprise SSO?</span>{" "}
              <button className="text-emerald-400 hover:text-emerald-300 underline underline-offset-2">
                Configure SAML
              </button>
            </div>
          </div>

          {/* Security notice */}
          <p className="text-center text-xs text-muted-foreground leading-relaxed">
            By continuing, you agree to Vinguard&apos;s Terms of Service and acknowledge 
            our Privacy Policy. All sessions are encrypted end-to-end.
          </p>
        </CardContent>
      </Card>

      {/* Footer badges */}
      <div className="flex items-center gap-6 mt-8 text-muted-foreground">
        <div className="flex items-center gap-2 text-xs">
          <Lock className="w-3 h-3" />
          <span>256-bit SSL</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <Shield className="w-3 h-3" />
          <span>SOC 2 Certified</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <Car className="w-3 h-3" />
          <span>NMVTIS Partner</span>
        </div>
      </div>
    </div>
  )
}
