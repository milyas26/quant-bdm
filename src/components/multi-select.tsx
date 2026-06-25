import * as React from "react"
import { Check, ChevronsUpDown, X } from "lucide-react"

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

export interface MultiSelectOption {
  value: string
  label: string
  description?: string
}

interface MultiSelectProps {
  options: MultiSelectOption[]
  selected: string[]
  onChange: (selected: string[]) => void
  placeholder?: string
  searchPlaceholder?: string
  className?: string
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = "Pilih...",
  searchPlaceholder = "Cari...",
  className,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false)

  const optionMap = React.useMemo(
    () => new Map(options.map((o) => [o.value, o])),
    [options],
  )

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

  const renderBadges = () => {
    const badges = selected.map((value) => {
      const option = optionMap.get(value)
      return (
        <Badge key={value} variant="secondary" className="mr-1 gap-1 pr-0.5">
          {option?.label ?? value}
          <button
            type="button"
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
          </button>
        </Badge>
      )
    })

    if (badges.length > 4) {
      const remaining = badges.length - 4
      return [
        ...badges.slice(0, 4),
        <Badge key="more" variant="secondary" className="mr-1">
          +{remaining} lainnya
        </Badge>,
      ]
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
          className={cn("h-auto min-h-9 w-full justify-between bg-background/50 text-xs", className)}
        >
          {selected.length > 0 ? (
            <div className="flex flex-wrap gap-1">{renderBadges()}</div>
          ) : (
            <span className="text-xs text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-(--radix-popover-trigger-width) min-w-64 p-0" align="start">
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList className="mt-2">
            <CommandGroup>
              {options.map((option) => {
                const isSelected = selected.includes(option.value)
                return (
                  <CommandItem
                    key={option.value}
                    value={`${option.label} ${option.description ?? ""}`}
                    onSelect={() => handleSelect(option.value)}
                  >
                    <div
                      className={cn(
                        "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "opacity-50 [&_svg]:invisible",
                      )}
                    >
                      <Check className="h-4 w-4" />
                    </div>
                    <div className="flex w-full items-center justify-between gap-2">
                      <span className="font-medium">{option.label}</span>
                      {option.description && (
                        <span className="text-xs text-muted-foreground">
                          {option.description}
                        </span>
                      )}
                    </div>
                  </CommandItem>
                )
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
