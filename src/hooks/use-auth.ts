import { useState, useCallback } from "react"

const SESSION_KEY = "bdm_auth"
const SECRET_CODE = "SupriSpinach2026"

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    () => sessionStorage.getItem(SESSION_KEY) === "true"
  )

  const login = useCallback((code: string): boolean => {
    if (code === SECRET_CODE) {
      sessionStorage.setItem(SESSION_KEY, "true")
      setIsAuthenticated(true)
      return true
    }
    return false
  }, [])

  const logout = useCallback(() => {
    sessionStorage.removeItem(SESSION_KEY)
    setIsAuthenticated(false)
  }, [])

  return { isAuthenticated, login, logout }
}
