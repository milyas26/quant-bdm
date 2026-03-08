
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js"
import { Bar } from "react-chartjs-2"
import { format } from "date-fns"
import { useMemo } from "react"
import { formatNumber } from "@/lib/utils"

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

interface BrokerInventoryChartProps {
  data: any[]
  dataKey: string
  valueKey?: string // Key for value (Rp)
  label?: string
  title?: string
}

export function BrokerInventoryChart({
  data,
  dataKey,
  valueKey,
  label = "Value",
  title = "Chart",
}: BrokerInventoryChartProps) {
  const sortedData = useMemo(() => {
    return [...data].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    )
  }, [data])

  const chartData = useMemo(() => {
    return {
      labels: sortedData.map((item) => format(new Date(item.date), "dd MMM")),
      datasets: [
        {
          label: label,
          data: sortedData.map((item) => item[dataKey]),
          backgroundColor: sortedData.map((item) =>
            item[dataKey] >= 0
              ? "rgba(34, 197, 94, 0.7)" // green-500
              : "rgba(239, 68, 68, 0.7)" // red-500
          ),
          borderColor: sortedData.map((item) =>
            item[dataKey] >= 0
              ? "rgb(22, 163, 74)" // green-600
              : "rgb(220, 38, 38)" // red-600
          ),
          borderWidth: 1,
        },
      ],
    }
  }, [sortedData, dataKey, label])

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: !!title,
        text: title,
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            let label = context.dataset.label || ""
            if (label) {
              label += ": "
            }
            if (context.parsed.y !== null) {
              label += formatNumber(context.parsed.y) + " lot"
            }
            return label
          },
          afterLabel: function (context: any) {
            if (valueKey && sortedData[context.dataIndex]) {
              const value = sortedData[context.dataIndex][valueKey]
              if (value !== undefined) {
                return "Value: Rp " + formatNumber(value)
              }
            }
            return ""
          },
        },
      },
    },
    scales: {
      y: {
        grid: {
          color: "rgba(100, 100, 100, 0.1)",
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  }

  return (
    <div className="h-[300px] w-full rounded-md border p-4">
      <Bar options={options} data={chartData} />
    </div>
  )
}
