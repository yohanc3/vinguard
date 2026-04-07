"use client"

import { Shield, Lock } from "lucide-react"

export function LoginPageAmbient() {
  return (
    <>
      <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-30" />

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent" />

      <div className="absolute top-20 left-20 text-emerald-500/20 animate-pulse">
        <Shield className="w-24 h-24" />
      </div>
      <div className="absolute bottom-20 right-20 text-emerald-500/20 animate-pulse delay-500">
        <Lock className="w-20 h-20" />
      </div>
    </>
  )
}
