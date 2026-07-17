import { Routes, Route } from "react-router-dom"
import Layout from "./components/layout"
import ProtectedRoute from "./components/protected-route"
import LoginPage from "./pages/login"
import NotFound from "./pages/not-found"
import StocksPage from "./pages/stocks"
import StockDetail from "./pages/stock-detail"
import ExtraInfo from "./pages/extra-info"
import ScreenerAnalysis from "./pages/screener-analysis"
import Guides from "./pages/guides"
import Brokers from "./pages/brokers"
import BrokerAccumulationPage from "./pages/broker-streak"
import DemoTradingPage from "./pages/demo-trading"
import WatchlistPage from "./pages/watchlist"

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Layout />}>
          <Route path="/" element={<StocksPage />} />
          <Route path="stock/:ticker" element={<StockDetail />} />
          <Route path="extra-info" element={<ExtraInfo />} />
          <Route path="history" element={<ScreenerAnalysis />} />
          <Route path="guide" element={<Guides />} />
          <Route path="brokers" element={<Brokers />} />
          <Route path="broker-streak" element={<BrokerAccumulationPage />} />
          <Route path="portfolio" element={<DemoTradingPage />} />
          <Route path="watchlist" element={<WatchlistPage />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Route>
    </Routes>
  )
}

export default App
