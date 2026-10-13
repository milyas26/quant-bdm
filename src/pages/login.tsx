import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/hooks/use-auth"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function LoginPage() {
  const [code, setCode] = useState("")
  const [error, setError] = useState(false)
  const [shake, setShake] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const ok = login(code)
    if (ok) {
      navigate("/", { replace: true })
    } else {
      setError(true)
      setShake(true)
      setTimeout(() => setShake(false), 500)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8">
          <div className="font-mono text-sm font-semibold tracking-tight">
            quant<span className="text-brand">/bdm</span>
          </div>
          <h1 className="mt-6 text-xl font-semibold tracking-tight">Sign in</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Enter your access code to open the screener.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className={shake ? "animate-[shake_0.4s_ease-in-out]" : ""}>
            <label htmlFor="access-code" className="mb-1.5 block text-xs font-medium text-muted-foreground">
              Access code
            </label>
            <Input
              id="access-code"
              type="password"
              value={code}
              onChange={(e) => {
                setCode(e.target.value)
                setError(false)
              }}
              autoFocus
              aria-invalid={error}
              aria-describedby={error ? "access-code-error" : undefined}
              className="h-10"
            />
            {error && (
              <p id="access-code-error" className="mt-1.5 text-xs text-destructive">
                That code did not match. Check it and try again.
              </p>
            )}
          </div>

          <Button type="submit" className="h-10 w-full">
            Sign in
          </Button>
        </form>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-6px); }
          40% { transform: translateX(6px); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(4px); }
        }
      `}</style>
    </div>
  )
}
