import { Routes, Route } from "react-router-dom"
import Layout from "./components/layout"
import NotFound from "./pages/not-found"
import Dashboard from "./pages/dashboard"
import StocksPage from "./pages/stocks"
import Watchlist from "./pages/watchlist"
import StockDetail from "./pages/stock-detail"

export function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="stock" element={<StocksPage />} />
        <Route path="watchlist" element={<Watchlist />} />
        <Route path="stock/:ticker" element={<StockDetail />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}

export default App
