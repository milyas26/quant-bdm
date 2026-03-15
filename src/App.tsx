import { Routes, Route, Navigate } from "react-router-dom"
import Layout from "./components/layout"
import NotFound from "./pages/not-found"
// import Dashboard from "./pages/dashboard"
import StocksPage from "./pages/stocks"
import StockDetail from "./pages/stock-detail"
import ExtraInfo from "./pages/extra-info"
import ScreenerAnalysis from "./pages/screener-analysis"

export function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        {/* redirect to stock */}
        <Route path="/" element={<Navigate to="/stock" />} />
        {/* <Route index element={<Dashboard />} /> */}
        <Route path="stock" element={<StocksPage />} />
        <Route path="stock/:ticker" element={<StockDetail />} />
        <Route path="extra-info" element={<ExtraInfo />} />
        <Route path="screener-analysis" element={<ScreenerAnalysis />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}

export default App
