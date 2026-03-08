import { useEffect, useRef, memo } from "react"

function TradingViewWidget({ symbol }: { symbol: string }) {
  const container = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!container.current) return

    // Clean up previous script if any
    container.current.innerHTML = ""

    const script = document.createElement("script")
    script.src =
      "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js"
    script.type = "text/javascript"
    script.async = true
    script.innerHTML = `
        {
          "width": "100%",
          "height": "700",
          "symbol": "IDX:${symbol}",
          "interval": "D",
          "timezone": "Asia/Jakarta",
          "theme": "light",
          "style": "1",
          "locale": "en",
          "enable_publishing": false,
          "allow_symbol_change": false,
          "calendar": false,
          "support_host": "https://www.tradingview.com"
        }`
    container.current.appendChild(script)
  }, [symbol])

  return (
    <div
      className="tradingview-widget-container overflow-hidden rounded-lg border"
      ref={container}
    >
      <div className="tradingview-widget-container__widget"></div>
    </div>
  )
}

export default memo(TradingViewWidget)
