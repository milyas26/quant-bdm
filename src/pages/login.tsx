import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/hooks/use-auth"

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
    <div className="min-h-screen flex items-center justify-center bg-(--background)">
      <div className="w-full max-w-sm px-8 py-10 border border-(--border) bg-(--card) rounded-(--radius) shadow-sm">
        <div className="mb-8 text-center">
          <div className="inline-block font-mono text-xs tracking-widest uppercase text-(--muted-foreground) mb-3">
            BDM Research
          </div>
          <h1 className="text-2xl font-semibold text-(--foreground) tracking-tight font-[JetBrains_Mono_Variable,monospace]">
            Enter Access Code
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div
            className={`transition-transform duration-100 ${shake ? "animate-[shake_0.4s_ease-in-out]" : ""}`}
          >
            <input
              type="password"
              value={code}
              onChange={(e) => {
                setCode(e.target.value)
                setError(false)
              }}
              placeholder="Access code"
              autoFocus
              className={`w-full px-4 py-3 font-mono text-sm bg-(--background) border rounded-(--radius) outline-none transition-colors
                text-(--foreground) placeholder:text-(--muted-foreground)
                focus:border-(--ring)
                ${error ? "border-red-500 focus:border-red-500" : "border-(--input)"}`}
            />
            {error && (
              <p className="mt-1.5 text-xs text-red-500 font-mono">
                Invalid access code.
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 bg-(--primary) text-(--primary-foreground) text-sm font-mono font-medium rounded-(--radius) hover:opacity-90 transition-opacity cursor-pointer"
          >
            Enter
          </button>
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
