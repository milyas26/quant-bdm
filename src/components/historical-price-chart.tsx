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
} from "chart.js"
import { Chart } from "react-chartjs-2"
import { format } from "date-fns"
import { useMemo } from "react"
import { formatNumber } from "@/lib/utils"
import type { HistoricalData } from "@/lib/apis/historical-data/interface"

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
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
}

export function HistoricalPriceChart({
  data,
  inventoryDatasets,
  title = "Historical Price",
}: HistoricalPriceChartProps) {
  const sortedData = useMemo(() => {
    return [...data].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    )
  }, [data])

  const chartData = useMemo(() => {
    const labels = sortedData.map((item) => format(new Date(item.date), "dd MMM"))
    
    const datasets: any[] = [
      {
        type: "bar" as const,
        label: "Volume",
        data: sortedData.map((item) => item.volume),
        backgroundColor: sortedData.map((item) =>
          item.change_percentage >= 0
            ? "rgba(34, 197, 94, 0.3)" // green-500
            : "rgba(239, 68, 68, 0.3)" // red-500
        ),
        borderColor: sortedData.map((item) =>
          item.change_percentage >= 0
            ? "rgb(22, 163, 74)" // green-600
            : "rgb(220, 38, 38)" // red-600
        ),
        borderWidth: 1,
        yAxisID: "y2",
        order: 3,
        barPercentage: 0.5,
        hidden: false,
      },
      {
        type: "line" as const,
        label: "Close Price",
        data: sortedData.map((item) => item.close),
        borderColor: "rgb(251, 191, 36)", // amber-400
        backgroundColor: "rgba(251, 191, 36, 0.5)",
        borderWidth: 3,
        pointRadius: 0, 
        pointHoverRadius: 4,
        tension: 0.1,
        yAxisID: "y",
        order: 1,
        hidden: false,
      },
    ]

    if (inventoryDatasets && inventoryDatasets.length > 0) {
        inventoryDatasets.forEach((dataset, index) => {
            // Create map for this dataset
            const inventoryMap = new Map(
                dataset.data.map(item => [
                    new Date(item.date).toISOString().split("T")[0],
                    item.value
                ])
            )

            datasets.push({
                type: "line" as const,
                label: dataset.label,
                data: sortedData.map(item => {
                    const dateStr = new Date(item.date).toISOString().split("T")[0]
                    return inventoryMap.get(dateStr) || null
                }),
                borderColor: dataset.color,
                backgroundColor: dataset.color.replace("rgb", "rgba").replace(")", ", 0.5)"),
                borderWidth: 2,
                pointRadius: 0,
                yAxisID: "y1",
                order: 2 + index,
                hidden: !["Smart Money", "Dumb Money"].includes(dataset.label),
            })
        })
    }

    return {
      labels,
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
                size: 10
            },
            filter: function(item: any) {
                // Hide Volume and Close Price from legend
                return !["Volume", "Close Price"].includes(item.text);
            }
        }
      },
      title: {
        display: false,
        text: title,
      },
      tooltip: {
        mode: "index" as const,
        intersect: false,
        callbacks: {
          label: function (context: any) {
            let label = context.dataset.label || ""
            if (label) {
              label += ": "
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
                size: 10
            }
        }
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
        grid: {
          display: false,
        },
        ticks: {
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
    <div className="relative w-full border p-2 rounded-sm text-card-foreground">
      <div className="h-[300px] w-full">
        <Chart type="line" options={options} data={chartData} />
      </div>
    </div>
  )
}
