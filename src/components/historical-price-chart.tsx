import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  TimeSeriesScale,
} from "chart.js"
import { Chart } from "react-chartjs-2"
import { useMemo } from "react"
import { formatNumber } from "@/lib/utils"
import type { HistoricalData } from "@/lib/apis/historical-data/interface"
import {
  CandlestickController,
  CandlestickElement,
  OhlcController,
  OhlcElement,
} from "chartjs-chart-financial"
import "chartjs-adapter-date-fns"

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  TimeSeriesScale,
  CandlestickController,
  CandlestickElement,
  OhlcController,
  OhlcElement
)

interface HistoricalPriceChartProps {
  data: HistoricalData[]
  inventoryDatasets?: {
    label: string
    data: {
      date: string
      value: number
    }[]
    color: string
  }[]
  title?: string
  height?: number
}

export function HistoricalPriceChart({
  data,
  inventoryDatasets,
  title = "Historical Price",
  height = 400,
}: HistoricalPriceChartProps) {
  const sortedData = useMemo(() => {
    return [...data].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    )
  }, [data])

  const chartData = useMemo(() => {
    const datasets: any[] = [
      {
        type: "bar" as const,
        label: "Volume",
        data: sortedData.map((item) => ({
          x: new Date(item.date).getTime(),
          y: item.volume,
        })),
        backgroundColor: sortedData.map(
          (item) =>
            item.change_percentage >= 0
              ? "rgba(38, 166, 154, 0.5)" // teal-400 equivalent
              : "rgba(239, 83, 80, 0.5)" // red-400 equivalent
        ),
        borderColor: sortedData.map(
          (item) =>
            item.change_percentage >= 0
              ? "#26a69a" // teal-400
              : "#ef5350" // red-400
        ),
        borderWidth: 0,
        yAxisID: "y2",
        order: 3,
        barPercentage: 0.5,
        hidden: false,
      },
      {
        type: "candlestick" as const,
        label: "Price",
        data: sortedData.map((item) => ({
          x: new Date(item.date).getTime(),
          o: Number(item.open),
          h: Number(item.high),
          l: Number(item.low),
          c: Number(item.close),
        })),
        backgroundColors: {
          up: "#26a69a", // teal-400
          down: "#ef5350", // red-400
          unchanged: "#787b86", // gray-500
        },
        borderColors: {
          up: "#26a69a",
          down: "#ef5350",
          unchanged: "#787b86",
        },
        backgroundColor: "rgba(0, 0, 0, 1)", // Fallback
        barPercentage: 0.9,
        categoryPercentage: 0.8,
        yAxisID: "y",
        order: 1,
        hidden: false,
      },
    ]

    if (inventoryDatasets && inventoryDatasets.length > 0) {
      inventoryDatasets.forEach((dataset, index) => {
        // Create map for this dataset
        const inventoryMap = new Map(
          dataset.data.map((item) => [
            new Date(item.date).toISOString().split("T")[0],
            item.value,
          ])
        )

        datasets.push({
          type: "line" as const,
          label: dataset.label,
          data: sortedData.map((item) => {
            const dateStr = new Date(item.date).toISOString().split("T")[0]
            const val = inventoryMap.get(dateStr)
            return {
              x: new Date(item.date).getTime(),
              y: val !== undefined ? val : null,
            }
          }),
          borderColor: dataset.color,
          backgroundColor: dataset.color
            .replace("rgb", "rgba")
            .replace(")", ", 0.5)"),
          borderWidth: 1.5,
          pointRadius: 0,
          yAxisID: "y1",
          order: 2 + index,
          hidden: !["Smart Money", "Dumb Money", "Smart Money Score"].includes(
            dataset.label
          ),
        })
      })
    }

    return {
      datasets,
    }
  }, [sortedData, inventoryDatasets])

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true, // Show legend since we have 2 datasets
        position: "top" as const,
        align: "end" as const,
        labels: {
          usePointStyle: true,
          boxWidth: 8,
          font: {
            size: 10,
          },
          filter: function (item: any) {
            // Hide Volume and Price from legend
            return !["Volume", "Price"].includes(item.text)
          },
        },
      },
      title: {
        display: false,
        text: title,
      },
      tooltip: {
        mode: "index" as const,
        intersect: false,
        itemSort: function (a: any, b: any) {
          return a.dataset.order - b.dataset.order
        },
        callbacks: {
          label: function (context: any) {
            let label = context.dataset.label || ""
            if (label) {
              label += ": "
            }
            if (context.dataset.type === "candlestick") {
              const raw = context.raw as any
              return `${label} O: ${formatNumber(raw.o)} H: ${formatNumber(raw.h)} L: ${formatNumber(raw.l)} C: ${formatNumber(raw.c)}`
            }
            if (context.parsed.y !== null) {
              label += formatNumber(context.parsed.y)
            }
            return label
          },
        },
      },
    },
    scales: {
      y: {
        type: "linear" as const,
        display: true,
        position: "left" as const,
        grace: "10%",
        grid: {
          color: "rgba(100, 100, 100, 0.1)",
        },
        ticks: {
          callback: function (value: any) {
            return formatNumber(value)
          },
          font: {
            size: 10,
          },
        },
      },
      y1: {
        type: "linear" as const,
        display: !!(inventoryDatasets && inventoryDatasets.length > 0),
        position: "right" as const,
        grid: {
          drawOnChartArea: false,
        },
        ticks: {
          callback: function (value: any) {
            return formatNumber(value)
          },
          font: {
            size: 10,
          },
        },
      },
      y2: {
        type: "linear" as const,
        display: false,
        position: "right" as const,
        grid: {
          drawOnChartArea: false,
        },
        beginAtZero: true,
        max: Math.max(...sortedData.map((d) => d.volume)) * 4, // Make volume bars take up lower 25%
      },
      x: {
        type: "timeseries" as const,
        time: {
          unit: "day" as const,
          displayFormats: {
            day: "dd MMM",
          },
          tooltipFormat: "dd MMM yyyy",
        },
        grid: {
          display: false,
        },
        ticks: {
          source: "data" as const,
          maxTicksLimit: 10,
          maxRotation: 0,
          font: {
            size: 10,
          },
        },
      },
    },
    interaction: {
      mode: "index" as const,
      intersect: false,
    },
  }

  return (
    <div className="relative w-full rounded-sm border p-2 text-card-foreground">
      <div style={{ height: `${height}px` }} className="w-full">
        <Chart type="candlestick" options={options as any} data={chartData} />
      </div>
    </div>
  )
}
