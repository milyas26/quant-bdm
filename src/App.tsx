import { Routes, Route } from "react-router-dom"
import Layout from "./components/layout"
import StocksPage from "./pages/stocks/stocks"
import NotFound from "./pages/not-found"
import Dashboard from "./pages/dashboard"
import MarketDataPage from "./pages/backoffice/market-data/market-data"

export function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="stocks" element={<StocksPage />} />
        <Route path="backoffice/market-data" element={<MarketDataPage />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}

export default App
