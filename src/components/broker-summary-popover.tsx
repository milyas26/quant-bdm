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

interface BrokerSummaryPopoverProps {
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
        className="max-h-[500px] w-[800px] max-w-none overflow-y-auto border border-gray-200 bg-white p-1 text-gray-900 shadow-xl dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
        side="top"
        align="start"
      >
        <BrokerSummaryContent data={data} />
      </PopoverContent>
    </Popover>
  )
}

function BrokerSummaryContent({
  data,
}: {
  data: { buys: BrokerBuy[]; sells: BrokerSell[] }
}) {
  // Helper to format average price
  const formatAvg = (num: number) => Math.round(num).toLocaleString()

  // 1. Sort Data by Value (descending)
  const sortedBuys = React.useMemo(
    () =>
      [...data.buys].sort(
        (a, b) => parseFloat(b.bval || "0") - parseFloat(a.bval || "0")
      ),
    [data.buys]
  )

  const sortedSells = React.useMemo(
    () =>
      [...data.sells].sort(
        (a, b) => parseFloat(b.sval || "0") - parseFloat(a.sval || "0")
      ),
    [data.sells]
  )

  // 2. Calculate Totals
  const totalVol = React.useMemo(
    () =>
      sortedBuys.reduce(
        (acc, curr) => acc + parseFloat(curr.blot || "0"),
        0
      ),
    [sortedBuys]
  )

  const totalVal = React.useMemo(
    () =>
      sortedBuys.reduce(
        (acc, curr) => acc + parseFloat(curr.bval || "0"),
        0
      ),
    [sortedBuys]
  )

  // 3. Calculate Top N (Buy - Sell)
  const calculateTopN = (n: number) => {
    const topBuys = sortedBuys.slice(0, n)
    const topSells = sortedSells.slice(0, n)

    console.log('topBuys', topBuys);
    console.log('topSells', topSells);

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
  const avgPercent = totalVol === 0 ? 0 : (avgVol / totalVol) * 100
  const avgStatus = getBandarStatus(avgVol, totalVol)

  const averageRow = {
    label: "Average",
    volume: avgVol,
    percent: Math.abs(avgPercent).toFixed(1),
    value: avgVal,
    status: avgStatus,
  }

  const detectorRows = [top1, top3, top5, averageRow]

  // 5. Broker Summary Stats (Middle Section)
  const buyerCount = sortedBuys.length
  const sellerCount = sortedSells.length
  const brokerDiff = buyerCount - sellerCount // Buyer - Seller
  // If Buyer < Seller => Acc (Negative diff). If Buyer > Seller => Dist (Positive diff).
  const brokerStatus =
    brokerDiff < 0 ? "Acc" : brokerDiff > 0 ? "Dist" : "Neutral"

  const avgPrice = totalVol === 0 ? 0 : totalVal / (totalVol * 100) // Assuming Lot = 100 shares

  // 6. Prepare Rows for Detailed Table
  const rows = []
  const maxRows = Math.max(sortedBuys.length, sortedSells.length)
  for (let i = 0; i < maxRows; i++) {
    rows.push({
      buy: sortedBuys[i],
      sell: sortedSells[i],
    })
  }

  console.log('detectorRows', detectorRows)

  return (
    <div className="grid grid-cols-12 gap-2">
      <div className="col-span-5 mb-4 text-xs">
        {/* Bandar Detector Table */}
        <p className="mb-1 text-sm font-semibold text-gray-900 dark:text-gray-100">
          Bandar Detector
        </p>
        <div className="mb-4 overflow-hidden rounded-md border">
          <div className="grid grid-cols-5 border-b bg-gray-50 p-2 font-semibold text-gray-500 dark:bg-gray-800 dark:text-gray-400">
            <div className="col-span-1"></div>
            <div className="text-right">Volume</div>
            <div className="text-right">%</div>
            <div className="text-right">Value</div>
            <div className="text-center">Acc/Dist</div>
          </div>
          {detectorRows.map((row, idx) => (
            <div
              key={idx}
              className="grid grid-cols-5 items-center border-b p-2 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <div className="font-semibold">{row.label}</div>
              <div className="text-right">{formatNumber(row.volume)}</div>
              <div className="text-right">{row.percent}</div>
              <div className="text-right">{formatNumber(row.value)}</div>
              <div className="flex justify-center">
                <span
                  className={`rounded px-2 py-0.5 text-[10px] font-semibold ${getBandarColor(
                    row.status
                  )}`}
                >
                  {row.status}
                </span>
              </div>
            </div>
          ))}
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
            className={`rounded px-6 py-1 text-[10px] font-semibold ${getBandarColor(
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
          <div className="text-right font-mono">
            {formatNumber(totalVal)}
          </div>
        </div>
        <div className="mb-1 grid grid-cols-2 gap-2">
          <div>Average (Rp)</div>
          <div className="text-right font-mono">
            {Math.round(avgPrice).toLocaleString()}
          </div>
        </div>
      </div>
      <div className="col-span-7">
        <p className="mb-1 text-sm font-semibold text-gray-900 dark:text-gray-100">
          Broker Summary
        </p>
        <div className="rounded-md border text-xs">
          {/* Header */}
          <div className="sticky top-0 z-10 grid grid-cols-2 gap-4 rounded-t-md border-b bg-gray-50 p-2 font-semibold text-gray-500 dark:bg-gray-800 dark:text-gray-400">
            <div className="grid grid-cols-4 gap-1">
              <span>BY</span>
              <span className="text-right">B.val</span>
              <span className="text-right">B.lot</span>
              <span className="text-right">B.avg</span>
            </div>
            <div className="grid grid-cols-4 gap-1">
              <span>SL</span>
              <span className="text-right">S.val</span>
              <span className="text-right">S.lot</span>
              <span className="text-right">S.avg</span>
            </div>
          </div>
          {/* Rows */}
          <div className="">
            {rows.map((row, idx) => (
              <div
                key={idx}
                className="grid grid-cols-2 gap-4 border-b px-2 py-1 last:border-0 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800"
              >
                {/* Buy Side */}
                <div className="grid grid-cols-4 items-center gap-1">
                  {row.buy ? (
                    <>
                      <span
                        className={`font-bold ${getBrokerColor(row.buy.type)}`}
                      >
                        {row.buy.netbsBrokerCode}
                      </span>
                      <span className="text-right text-green-600 dark:text-green-400">
                        {formatNumber(parseFloat(row.buy.bval))}
                      </span>
                      <span className="text-right text-green-600 dark:text-green-400">
                        {formatNumber(parseFloat(row.buy.blot))}
                      </span>
                      <span className="text-right text-green-600 dark:text-green-400">
                        {formatAvg(parseFloat(row.buy.netbsBuyAvgPrice))}
                      </span>
                    </>
                  ) : (
                    <div className="col-span-4"></div>
                  )}
                </div>
                {/* Sell Side */}
                <div className="grid grid-cols-4 items-center gap-1">
                  {row.sell ? (
                    <>
                      <span
                        className={`font-bold ${getBrokerColor(row.sell.type)}`}
                      >
                        {row.sell.netbsBrokerCode}
                      </span>
                      <span className="text-right text-red-600 dark:text-red-400">
                        {formatNumber(parseFloat(row.sell.sval))}
                      </span>
                      <span className="text-right text-red-600 dark:text-red-400">
                        {formatNumber(parseFloat(row.sell.slot))}
                      </span>
                      <span className="text-right text-red-600 dark:text-red-400">
                        {formatAvg(parseFloat(row.sell.netbsSellAvgPrice))}
                      </span>
                    </>
                  ) : (
                    <div className="col-span-4"></div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
