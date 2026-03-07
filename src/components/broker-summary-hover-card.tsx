"use client"

import * as React from "react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import type { BrokerBuy, BrokerSell } from "@/lib/api"
import { formatNumber, getBrokerColor } from "@/lib/utils"

interface BrokerSummaryHoverCardProps {
  children: React.ReactNode
  data: { buys: BrokerBuy[]; sells: BrokerSell[] } | undefined
}

export function BrokerSummaryHoverCard({
  children,
  data,
}: BrokerSummaryHoverCardProps) {
  if (!data) return <>{children}</>

  // Helper to format average price
  const formatAvg = (num: number) => Math.round(num).toLocaleString()

  // Prepare rows (show all)
  const rows = []
  const maxRows = Math.max(data.buys.length, data.sells.length)
  for (let i = 0; i < maxRows; i++) {
    rows.push({
      buy: data.buys[i],
      sell: data.sells[i],
    })
  }

  return (
    <TooltipProvider>
      <Tooltip delayDuration={200}>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent
          showArrow={false}
          className="max-w-none border border-gray-200 bg-white p-0 text-gray-900 shadow-xl dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 max-h-[500px] overflow-y-auto"
          side="top"
          align="start"
        >
          <div className="text-xs">
            {/* Header */}
            <div className="grid grid-cols-2 gap-4 border-b bg-gray-50 p-2 font-semibold text-gray-500 dark:bg-gray-800 dark:text-gray-400 sticky top-0 z-10">
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
                          className={`font-bold ${getBrokerColor(
                            row.buy.type
                          )}`}
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
                          className={`font-bold ${getBrokerColor(
                            row.sell.type
                          )}`}
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
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}


