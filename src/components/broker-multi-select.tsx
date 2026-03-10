import * as React from "react"
import {
  Check,
  ChevronsUpDown,
  X,
  ChevronRight,
  ChevronDown,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"

export interface BrokerOption {
  value: string
  label: string
  name: string
  type: string
}

interface BrokerMultiSelectProps {
  options: Record<string, BrokerOption[]>
  selected: string[]
  onChange: (selected: string[]) => void
  placeholder?: string
  className?: string
}

export function BrokerMultiSelect({
  options,
  selected,
  onChange,
  placeholder = "Select brokers...",
  className,
}: BrokerMultiSelectProps) {
  const [open, setOpen] = React.useState(false)
  const [collapsedGroups, setCollapsedGroups] = React.useState<
    Record<string, boolean>
  >({
    LOKAL: true,
    ASING: true,
    PEMERINTAH: true,
    RITEL: true,
    SMART_MONEY: true,
  })

  const isInitialized = React.useRef(false)

  // Default to RETAIL if nothing is selected
  React.useEffect(() => {
    if (!isInitialized.current && Object.keys(options).length > 0) {
      if (selected.length === 0) {
        const retailGroup = options["RITEL"]
        if (retailGroup && retailGroup.length > 0) {
          onChange(retailGroup.map((item) => item.value))
        }
      }
      isInitialized.current = true
    }
  }, [options, selected, onChange])

  const handleSelect = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((item) => item !== value))
    } else {
      onChange([...selected, value])
    }
  }

  const handleRemove = (valueToRemove: string) => {
    onChange(selected.filter((item) => item !== valueToRemove))
  }

  const toggleGroup = (group: string) => {
    setCollapsedGroups((prev) => ({
      ...prev,
      [group]: !prev[group],
    }))
  }

  const handleGroupSelect = (groupItems: BrokerOption[]) => {
    const groupValues = groupItems.map((item) => item.value)
    const allSelected = groupValues.every((value) => selected.includes(value))

    if (allSelected) {
      onChange(selected.filter((value) => !groupValues.includes(value)))
    } else {
      const newSelected = Array.from(new Set([...selected, ...groupValues]))
      onChange(newSelected)
    }
  }

  const renderBadges = () => {
    const badges: React.ReactNode[] = []
    const selectedSet = new Set(selected)

    // Check each group
    Object.entries(options).forEach(([type, items]) => {
      const groupValues = items.map((item) => item.value)
      const allSelected = groupValues.every((value) => selectedSet.has(value))

      if (allSelected && groupValues.length > 0) {
        // Render group badge
        badges.push(
          <Badge key={type} variant="secondary" className="mr-1 gap-1 pr-0.5">
            {type} (All)
            <div
              className="ml-1 cursor-pointer rounded-full ring-offset-background hover:bg-muted focus:ring-2 focus:ring-ring focus:ring-offset-2"
              onMouseDown={(e) => {
                e.preventDefault()
                e.stopPropagation()
              }}
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                handleGroupSelect(items)
              }}
            >
              <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
            </div>
          </Badge>
        )
        // Remove group values from selectedSet so we don't render individual badges
        groupValues.forEach((v) => selectedSet.delete(v))
      }
    })

    // Render remaining individual badges
    selectedSet.forEach((value) => {
      badges.push(
        <Badge key={value} variant="secondary" className="mr-1 gap-1 pr-0.5">
          {value}
          <div
            className="ml-1 cursor-pointer rounded-full ring-offset-background hover:bg-muted focus:ring-2 focus:ring-ring focus:ring-offset-2"
            onMouseDown={(e) => {
              e.preventDefault()
              e.stopPropagation()
            }}
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              handleRemove(value)
            }}
          >
            <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
          </div>
        </Badge>
      )
    })

    if (badges.length > 4) {
      const remaining = badges.length - 4
      const visibleBadges = badges.slice(0, 4)
      visibleBadges.push(
        <Badge key="more" variant="secondary" className="mr-1">
          +{remaining} lainnya
        </Badge>
      )
      return visibleBadges
    }

    return badges
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("h-auto min-h-10 w-full justify-between", className)}
        >
          {selected.length > 0 ? (
            <div className="flex flex-wrap gap-1">{renderBadges()}</div>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search broker..." />
          <CommandList className="mt-2">
            {Object.entries(options).map(([type, items]) => {
              const isGroupSelected = items.every((item) =>
                selected.includes(item.value)
              )
              const isGroupPartiallySelected =
                !isGroupSelected &&
                items.some((item) => selected.includes(item.value))

              return (
                <React.Fragment key={type}>
                  <div className="flex items-center justify-between bg-muted/50 px-2 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted">
                    <div
                      className="flex flex-1 cursor-pointer items-center"
                      onClick={() => toggleGroup(type)}
                    >
                      {collapsedGroups[type] ? (
                        <ChevronRight className="mr-1 h-3 w-3" />
                      ) : (
                        <ChevronDown className="mr-1 h-3 w-3" />
                      )}
                      {type} ({items.length})
                    </div>
                    <div
                      className={cn(
                        "flex h-4 w-4 cursor-pointer items-center justify-center rounded-sm border border-primary",
                        isGroupSelected
                          ? "bg-primary text-primary-foreground"
                          : isGroupPartiallySelected
                            ? "bg-primary/50 text-primary-foreground"
                            : "opacity-50 [&_svg]:invisible"
                      )}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleGroupSelect(items)
                      }}
                    >
                      <Check className={cn("h-3 w-3")} />
                    </div>
                  </div>
                  {!collapsedGroups[type] && (
                    <CommandGroup>
                      {items.map((option) => {
                        const isSelected = selected.includes(option.value)
                        return (
                          <CommandItem
                            key={option.value}
                            value={option.value}
                            onSelect={() => {
                              handleSelect(option.value)
                            }}
                          >
                            <div
                              className={cn(
                                "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                                isSelected
                                  ? "bg-primary text-primary-foreground"
                                  : "opacity-50 [&_svg]:invisible"
                              )}
                            >
                              <Check className={cn("h-4 w-4")} />
                            </div>
                            <div className="flex gap-2 w-full">
                              <span className="font-medium">{option.value}</span>
                              <span className="text-sm text-muted-foreground">
                                {option.name}
                              </span>
                            </div>
                          </CommandItem>
                        )
                      })}
                    </CommandGroup>
                  )}
                </React.Fragment>
              )
            })}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
