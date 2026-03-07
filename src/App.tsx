import { Routes, Route } from "react-router-dom"
import Layout from "./components/layout"
import NotFound from "./pages/not-found"
import Dashboard from "./pages/dashboard"
import StocksPage from "./pages/stocks"
import Watchlist from "./pages/watchlist"

export function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="stocks" element={<StocksPage />} />
        <Route path="watchlist" element={<Watchlist />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}

export default App
