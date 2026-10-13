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
  getBrokerCodeClass,
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
        className="max-h-125 w-200 max-w-none overflow-y-auto border border-border bg-popover p-1 text-popover-foreground -xl"
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
      <div>
        {brokerCode && selectedTicker && date ? (
          <div className="flex flex-col items-center justify-center space-y-4 text-sm text-muted-foreground">
            <div className="w-full">
              <div className="rounded-lg border bg-card px-4 py-3 text-sm">
                <BrokerBalance
                  brokerCode={brokerCode}
                  selectedTicker={selectedTicker}
                  date={date}
                />
              </div>
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
      {brokerCode && selectedTicker && date && (
        <div className="flex flex-col items-center justify-center space-y-4 text-sm text-muted-foreground">
          <div className="w-full">
            <div className="rounded-lg border bg-card px-4 py-3 text-sm">
              <BrokerBalance
                brokerCode={brokerCode}
                selectedTicker={selectedTicker}
                date={date}
              />
            </div>
          </div>
        </div>
      )}

      <div className="rounded-lg border bg-card px-4 py-3 text-sm">
        <p className="mb-1 text-sm font-semibold text-card-foreground">
          Bandar Detector
        </p>
        <div className="mb-4 overflow-x-auto rounded-md border">
          <table className="w-full font-mono text-xs tabular-nums">
            <thead className="bg-muted/60 font-sans font-medium text-muted-foreground">
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
                <tr key={idx} className="border-b border-border/70 last:border-0 hover:bg-muted/40">
                  <td className="p-2 font-sans font-medium">{row.label}</td>
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
      <div className="bg-card px-4 py-3 ">
        <p className="mb-1 text-sm font-semibold text-card-foreground">
          Broker Summary
        </p>
        <div className="scrollbar-thin max-h-150 overflow-auto rounded-md border text-[12px]">
          <table className="w-full min-w-[480px] font-mono xl:min-w-0 tabular-nums">
            <thead className="sticky top-0 bg-muted font-sans text-xs font-medium text-muted-foreground">
              <tr>
                <th className="w-[10%] px-2 py-2 text-left">BY</th>
                <th className="w-[13%] px-2 py-2 text-right">B.val</th>
                <th className="w-[13%] px-2 py-2 text-right">B.lot</th>
                <th className="w-[13%] px-2 py-2 text-right">B.avg</th>
                <th className="w-[10%] px-2 py-2 text-left">SL</th>
                <th className="w-[13%] px-2 py-2 text-right">S.val</th>
                <th className="w-[13%] px-2 py-2 text-right">S.lot</th>
                <th className="w-[13%] px-2 py-2 text-right">S.avg</th>
              </tr>
            </thead>
            <tbody className="divide-y-0">
              {rows.map((row, idx) => (
                <tr key={idx} className="border-b border-border/70 last:border-0 hover:bg-muted/40">
                  {/* Buy Side */}
                  <td className="px-2 py-1.5 font-bold">
                    {row.buy && (
                      <span className={getBrokerCodeClass(row.buy.netbsBrokerCode)}>
                        {row.buy.netbsBrokerCode}
                      </span>
                    )}
                  </td>
                  <td className="px-2 py-1.5 text-right text-positive ">
                    {row.buy && formatNumber(parseFloat(row.buy.bval))}
                  </td>
                  <td className="px-2 py-1.5 text-right text-positive ">
                    {row.buy &&
                      formatNumber(parseFloat(row.buy.blot).toFixed(0) as any)}
                  </td>
                  <td className="px-2 py-1.5 text-right text-positive ">
                    {row.buy && formatAvg(parseFloat(row.buy.netbsBuyAvgPrice))}
                  </td>

                  {/* Sell Side */}
                  <td className="px-2 py-1.5 font-bold">
                    {row.sell && (
                      <span className={getBrokerCodeClass(row.sell.netbsBrokerCode)}>
                        {row.sell.netbsBrokerCode}
                      </span>
                    )}
                  </td>
                  <td className="px-2 py-1.5 text-right text-negative ">
                    {row.sell && formatNumber(parseFloat(row.sell.sval))}
                  </td>
                  <td className="px-2 py-1.5 text-right text-negative ">
                    {row.sell &&
                      formatNumber(parseFloat(row.sell.slot).toFixed(0) as any)}
                  </td>
                  <td className="px-2 py-1.5 text-right text-negative ">
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
