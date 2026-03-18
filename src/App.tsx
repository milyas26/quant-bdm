import { Routes, Route } from "react-router-dom"
import Layout from "./components/layout"
import NotFound from "./pages/not-found"
import StocksPage from "./pages/stocks"
import StockDetail from "./pages/stock-detail"
import ExtraInfo from "./pages/extra-info"
import ScreenerAnalysis from "./pages/screener-analysis"
import Guides from "./pages/guides"
import Brokers from "./pages/brokers"
import DemoTradingPage from "./pages/demo-trading"

export function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        {/* redirect to stock */}
        <Route path="/" element={<StocksPage />} />
        <Route path="stock/:ticker" element={<StockDetail />} />
        <Route path="extra-info" element={<ExtraInfo />} />
        <Route path="history" element={<ScreenerAnalysis />} />
        <Route path="guide" element={<Guides />} />
        <Route path="brokers" element={<Brokers />} />
        <Route path="portfolio" element={<DemoTradingPage />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}

export default App
