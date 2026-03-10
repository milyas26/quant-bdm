"use client"

import * as React from "react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import type { BrokerBuy, BrokerSell } from "@/lib/api"
import {
  formatNumber,
  getBandarColor,
  getBandarStatus,
  getBrokerColor,
} from "@/lib/utils"

import { BrokerBalance } from "@/components/broker-balance"
import type { DateRange } from "react-day-picker"

export interface BrokerSummaryPopoverProps {
  children: React.ReactNode
  data: { buys: BrokerBuy[]; sells: BrokerSell[] } | undefined
}

export function BrokerSummaryPopover({
  children,
  data,
}: BrokerSummaryPopoverProps) {
  if (!data) return <>{children}</>

  return (
    <Popover>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent
        className="max-h-[500px] w-[800px] max-w-none overflow-y-auto border border-border bg-popover p-1 text-popover-foreground shadow-xl"
        side="top"
        align="start"
      >
        <BrokerSummaryContent data={data} />
      </PopoverContent>
    </Popover>
  )
}

export function BrokerSummaryContent({
  data,
  selectedTicker,
  date,
  brokerCode,
}: {
  data: { buys: BrokerBuy[]; sells: BrokerSell[] } | undefined
  selectedTicker?: string
  date?: DateRange
  brokerCode?: string
}) {
  // Helper to format average price
  const formatAvg = (num: number) => Math.round(num).toLocaleString()

  // 1. Sort Data by Value (descending)
  const sortedBuys = React.useMemo(
    () =>
      [...(data?.buys || [])].sort(
        (a, b) => parseFloat(b.bval || "0") - parseFloat(a.bval || "0")
      ),
    [data?.buys]
  )

  const sortedSells = React.useMemo(
    () =>
      [...(data?.sells || [])].sort(
        (a, b) => parseFloat(b.sval || "0") - parseFloat(a.sval || "0")
      ),
    [data?.sells]
  )

  // 2. Calculate Totals
  const totalVol = React.useMemo(
    () =>
      sortedBuys.reduce((acc, curr) => acc + parseFloat(curr.blot || "0"), 0),
    [sortedBuys]
  )

  const totalVal = React.useMemo(
    () =>
      sortedBuys.reduce((acc, curr) => acc + parseFloat(curr.bval || "0"), 0),
    [sortedBuys]
  )

  // 3. Calculate Top N (Buy - Sell)
  const calculateTopN = (n: number) => {
    const topBuys = sortedBuys.slice(0, n)
    const topSells = sortedSells.slice(0, n)

    const buyVol = topBuys.reduce(
      (acc, curr) => acc + parseFloat(curr.blot || "0"),
      0
    )
    const sellVol = topSells.reduce(
      (acc, curr) => acc + parseFloat(curr.slot || "0"),
      0
    )
    const buyVal = topBuys.reduce(
      (acc, curr) => acc + parseFloat(curr.bval || "0"),
      0
    )
    const sellVal = topSells.reduce(
      (acc, curr) => acc + parseFloat(curr.sval || "0"),
      0
    )

    const netVol = buyVol - sellVol
    const netVal = buyVal - sellVal

    const percent = totalVol === 0 ? 0 : (netVol / totalVol) * 100
    const status = getBandarStatus(netVol, totalVol)

    return {
      label: `Top ${n}`,
      volume: netVol,
      percent: Math.abs(percent).toFixed(1),
      value: netVal,
      status,
    }
  }

  const top1 = calculateTopN(1)
  const top3 = calculateTopN(3)
  const top5 = calculateTopN(5)

  // 4. Calculate Average Row
  const avgVol = (top1.volume + top3.volume + top5.volume) / 3
  const avgVal = (top1.value + top3.value + top5.value) / 3
  // Recalculate percent based on avgVol
  const avgPercent = totalVol === 0 ? 0 : (avgVol / totalVol) * 100
  const avgStatus = getBandarStatus(avgVol, totalVol)

  const averageRow = {
    label: "Average",
    volume: avgVol.toFixed(1),
    percent: Math.abs(avgPercent).toFixed(1),
    value: avgVal,
    status: avgStatus,
  }

  const detectorRows = [top1, top3, top5, averageRow]

  // 5. Broker Summary Stats (Middle Section)
  const buyerCount = sortedBuys.length
  const sellerCount = sortedSells.length
  const brokerDiff = buyerCount - sellerCount // Buyer - Seller

  const brokerStatus = avgStatus

  const avgPrice = totalVol === 0 ? 0 : totalVal / (totalVol * 100) // Assuming Lot = 100 shares

  // 6. Prepare Rows for Detailed Table
  const rows = React.useMemo(() => {
    const res = []
    const maxRows = Math.max(sortedBuys.length, sortedSells.length)
    for (let i = 0; i < maxRows; i++) {
      res.push({
        buy: sortedBuys[i],
        sell: sortedSells[i],
      })
    }
    return res
  }, [sortedBuys, sortedSells])

  if (!data)
    return (
      <div className="flex flex-col items-center justify-center space-y-4 text-sm text-muted-foreground">
        {brokerCode && selectedTicker && date ? (
          <div className="w-full">
            <div className="rounded-md border bg-card px-4 py-3 text-sm shadow-sm">
              <BrokerBalance
                brokerCode={brokerCode}
                selectedTicker={selectedTicker}
                date={date}
              />
            </div>
          </div>
        ) : (
          <div className="flex h-32 items-center justify-center">
            No data available
          </div>
        )}
      </div>
    )

  return (
    <div className="space-y-2">
      {/* Broker Balance Section */}
      <div className="flex flex-col items-center justify-center space-y-4 text-sm text-muted-foreground">
        {brokerCode && selectedTicker && date && (
          <div className="w-full">
            <div className="rounded-md border bg-card px-4 py-3 text-sm shadow-sm">
              <BrokerBalance
                brokerCode={brokerCode}
                selectedTicker={selectedTicker}
                date={date}
              />
            </div>
          </div>
        )}
      </div>

      <div className="rounded-md border bg-card px-4 py-3 text-sm shadow-sm">
        <p className="mb-1 text-sm font-semibold text-card-foreground">
          Bandar Detector
        </p>
        <div className="mb-4 overflow-hidden">
          <table className="w-full text-xs">
            <thead className="bg-muted font-semibold text-muted-foreground">
              <tr className="border-b">
                <th className="p-2 text-left"></th>
                <th className="p-2 text-right">Volume</th>
                <th className="p-2 text-right">%</th>
                <th className="p-2 text-right">Value</th>
                <th className="p-2 text-center">Acc/Dist</th>
              </tr>
            </thead>
            <tbody>
              {detectorRows.map((row, idx) => (
                <tr key={idx} className="hover:bg-muted/50">
                  <td className="p-2 font-semibold">{row.label}</td>
                  <td className="p-2 text-right">
                    {formatNumber(parseFloat(row.volume as string))}
                  </td>
                  <td className="p-2 text-right">
                    {parseFloat(row.percent).toFixed(1)}
                  </td>
                  <td className="p-2 text-right">{formatNumber(row.value)}</td>
                  <td className="p-2 text-center">
                    <span
                      className={`rounded px-2 py-0.5 text-xs font-semibold ${getBandarColor(
                        row.status
                      )}`}
                    >
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Broker Summary Stats */}
        <div className="mb-1 grid grid-cols-4 items-center gap-2">
          <div className="font-semibold">Broker</div>
          <div className="text-center">{buyerCount}</div>
          <div className="text-center">{sellerCount}</div>
          <div className="mr-2 text-right font-bold">{brokerDiff}</div>
        </div>
        <div className="mb-2 flex justify-end">
          <span
            className={`rounded px-6 py-1 text-xs font-semibold ${getBandarColor(
              brokerStatus
            )}`}
          >
            {brokerStatus}
          </span>
        </div>

        <div className="mb-1 grid grid-cols-2 gap-2">
          <div>Net Volume</div>
          <div className="text-right font-mono">
            {totalVol.toLocaleString()}
          </div>
        </div>
        <div className="mb-1 grid grid-cols-2 gap-2">
          <div>Net Value</div>
          <div className="text-right font-mono">{formatNumber(totalVal)}</div>
        </div>
        <div className="mb-1 grid grid-cols-2 gap-2">
          <div>Average (Rp)</div>
          <div className="text-right font-mono">
            {Math.round(avgPrice).toLocaleString()}
          </div>
        </div>
      </div>
      <div className="bg-card px-4 py-3 shadow-sm">
        <p className="mb-1 text-sm font-semibold text-card-foreground">
          Broker Summary
        </p>
        <div className="max-h-[500px] overflow-auto rounded-md text-[12px]">
          <table className="w-full">
            <thead className="bg-muted text-[12px] font-semibold text-muted-foreground">
              <tr>
                <th className="w-[10%] p-1 text-left">BY</th>
                <th className="w-[13%] p-1 text-right">B.val</th>
                <th className="w-[13%] p-1 text-right">B.lot</th>
                <th className="w-[13%] p-1 text-right">B.avg</th>
                <th className="w-[10%] p-1 text-left">SL</th>
                <th className="w-[13%] p-1 text-right">S.val</th>
                <th className="w-[13%] p-1 text-right">S.lot</th>
                <th className="w-[13%] p-1 text-right">S.avg</th>
              </tr>
            </thead>
            <tbody className="divide-y-0">
              {rows.map((row, idx) => (
                <tr key={idx} className="hover:bg-muted/50">
                  {/* Buy Side */}
                  <td className="p-1 font-bold">
                    {row.buy && (
                      <span className={getBrokerColor(row.buy.type)}>
                        {row.buy.netbsBrokerCode}
                      </span>
                    )}
                  </td>
                  <td className="p-1 text-right text-green-600 dark:text-green-400">
                    {row.buy && formatNumber(parseFloat(row.buy.bval))}
                  </td>
                  <td className="p-1 text-right text-green-600 dark:text-green-400">
                    {row.buy && formatNumber(parseFloat(row.buy.blot))}
                  </td>
                  <td className="p-1 text-right text-green-600 dark:text-green-400">
                    {row.buy && formatAvg(parseFloat(row.buy.netbsBuyAvgPrice))}
                  </td>

                  {/* Sell Side */}
                  <td className="p-1 font-bold">
                    {row.sell && (
                      <span className={getBrokerColor(row.sell.type)}>
                        {row.sell.netbsBrokerCode}
                      </span>
                    )}
                  </td>
                  <td className="p-1 text-right text-red-600 dark:text-red-400">
                    {row.sell && formatNumber(parseFloat(row.sell.sval))}
                  </td>
                  <td className="p-1 text-right text-red-600 dark:text-red-400">
                    {row.sell && formatNumber(parseFloat(row.sell.slot))}
                  </td>
                  <td className="p-1 text-right text-red-600 dark:text-red-400">
                    {row.sell &&
                      formatAvg(parseFloat(row.sell.netbsSellAvgPrice))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
