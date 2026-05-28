import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatIDR = (value: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

export const formatNumberWithDecimal = (value: number) => {
  return new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

export const formatNumber = (num: number) => {
  const absNum = Math.abs(num)
  if (absNum >= 1e12) return (num / 1e12).toFixed(1) + "T"
  if (absNum >= 1e9) return (num / 1e9).toFixed(1) + "B"
  if (absNum >= 1e6) return (num / 1e6).toFixed(1) + "M"
  if (absNum >= 1e3) return (num / 1e3).toFixed(1) + "K"
  return num.toString()
}

export function getBrokerColor(type: string) {
  switch (type?.toUpperCase()) {
    case "SMART_MONEY":
      return "text-blue-400"
    case "RITEL":
    case "RETAIL":
      return "text-amber-400"
    case "LOKAL":
      return "text-purple-400"
    case "PEMERINTAH":
      return "text-emerald-400"
    case "ASING":
      return "text-red-400"
    default:
      return "text-zinc-400"
  }
}

export const getBandarStatus = (netVol: number, totalVol: number) => {
  if (totalVol === 0) return "Neutral"
  const percent = (netVol / totalVol) * 100
  if (Math.abs(percent) < 3) return "Neutral"
  if (percent >= 20) return "Big Acc"
  if (percent >= 10) return "Normal Acc"
  if (percent >= 3) return "Small Acc"
  if (percent <= -10) return "Big Dist"
  if (percent <= -5) return "Small Dist"
  return "Neutral"
}

export const getBandarColor = (status: string) => {
  switch (status) {
    case "Big Acc":
      return "bg-green-500 text-white"
    case "Normal Acc":
      return "bg-green-300 text-green-800 dark:bg-green-900 dark:text-green-100"
    case "Small Acc":
      return "bg-green-200 text-green-800 dark:bg-green-900 dark:text-green-100"
    case "Acc":
      return "bg-green-200 text-green-800 dark:bg-green-900 dark:text-green-100"
    case "Neutral":
      return "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-100"
    case "Small Dist":
      return "bg-red-200 text-red-800 dark:bg-red-900 dark:text-red-100"
    case "Dist":
      return "bg-red-200 text-red-800 dark:bg-red-900 dark:text-red-100"
    case "Big Dist":
      return "bg-red-500 text-white"
    default:
      return "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-100"
  }
}

export const getBandarBgColor = (status: string) => {
  switch (status) {
    case "Big Acc":
      return "bg-green-500"
    case "Normal Acc":
      return "bg-green-400"
    case "Small Acc":
      return "bg-green-300"
    case "Acc":
      return "bg-green-300"
    case "Neutral":
      return "bg-gray-300"
    case "Small Dist":
      return "bg-red-300"
    case "Dist":
      return "bg-red-300"
    case "Big Dist":
      return "bg-red-500"
    default:
      return "bg-gray-200"
  }
}

export const calculateBandarStatus = (
  buys: any[],
  sells: any[],
  totalVol: number
) => {
  const calculateTopN = (n: number) => {
    const topBuys = buys.slice(0, n)
    const topSells = sells.slice(0, n)

    const buyVol = topBuys.reduce(
      (acc, curr) => acc + parseFloat(curr.blot || "0"),
      0
    )
    const sellVol = topSells.reduce(
      (acc, curr) => acc + parseFloat(curr.slot || "0"),
      0
    )

    return buyVol - sellVol
  }

  const top1 = calculateTopN(1)
  const top3 = calculateTopN(3)
  const top5 = calculateTopN(5)

  const avgVol = (top1 + top3 + top5) / 3
  return getBandarStatus(avgVol, totalVol)
}

// Return Tailwind class for specific broker code (used to color broker code labels)
export function getBrokerCodeClass(code?: string) {
  if (!code) return "text-muted-foreground"
  const c = code.toUpperCase()
  switch (c) {
    case "AI":
    case "BK":
    case "YU":
    case "CS":
    case "ZP":
    case "AK":
    case "NI":
    case "HS":
    case "KZ":
    case "IF":
    case "RX":
      return "font-semibold text-emerald-400 bg-emerald-400/10 px-0.5 rounded-sm"
    case "CC":
    case "CP":
    case "RF":
    case "SS":
    case "ES":
    case "HP":
    case "EP":
    case "MG":
      return "font-semibold text-blue-400 bg-blue-400/10 px-0.5 rounded-sm"
    case "XL":
    case "XC":
    case "PD":
    case "YP":
      return "font-semibold text-red-400 bg-red-400/10 px-0.5 rounded-sm"
    default:
      return "text-zinc-500 px-0.5 rounded-sm font-normal"
  }
}
