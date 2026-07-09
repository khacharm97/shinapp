import * as React from "react"
import { ChevronsUpDown, X, Search } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"

export type Option = {
  label: string
  value: string
}

interface MultiSelectProps {
  options: Option[]
  selected: string[]
  onChange: (values: string[]) => void
  placeholder?: string
  className?: string
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = "Select items...",
  className,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")

  const handleUnselect = (item: string) => {
    onChange(selected.filter((i) => i !== item))
  }

  const filteredOptions = options.filter(o => o.label.toLowerCase().includes(searchQuery.toLowerCase()))
  
  const showCreate = searchQuery.trim().length > 0 && 
    !options.some(o => o.label.toLowerCase() === searchQuery.toLowerCase()) &&
    !selected.includes(searchQuery.trim());

  // Prevent closing when typing in input
  const handleInputClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <div
          role="combobox"
          aria-expanded={open}
          className={cn("flex w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer min-h-10 h-auto", className)}
          onClick={() => setOpen(!open)}
        >
          <div className="flex flex-wrap gap-1">
            {selected.length === 0 && (
              <span className="text-muted-foreground font-normal">{placeholder}</span>
            )}
            {selected.map((item) => {
              const option = options.find((o) => o.value === item)
              const label = option ? option.label : item // Show raw value if not found in options
              return (
                <Badge
                  variant="secondary"
                  key={item}
                  className="mr-1 mb-1 font-normal"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleUnselect(item)
                  }}
                >
                  {label}
                  <button
                    type="button"
                    className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleUnselect(item)
                      }
                    }}
                    onMouseDown={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                    }}
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      handleUnselect(item)
                    }}
                  >
                    <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                  </button>
                </Badge>
              )
            })}
          </div>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)] p-0" align="start">
        <div className="p-2 border-b flex items-center gap-2" onClick={handleInputClick}>
          <Search className="w-4 h-4 text-muted-foreground" />
          <Input 
            autoFocus
            className="h-8 border-0 focus-visible:ring-0 shadow-none p-0" 
            placeholder="Search or type to create..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="max-h-64 overflow-auto py-1">
          {filteredOptions.map((option) => {
            const isSelected = selected.includes(option.value)
            return (
              <DropdownMenuCheckboxItem
                key={option.value}
                checked={isSelected}
                onCheckedChange={(checked) => {
                  if (checked) {
                    onChange([...selected, option.value])
                  } else {
                    onChange(selected.filter((val) => val !== option.value))
                  }
                }}
              >
                {option.label}
              </DropdownMenuCheckboxItem>
            )
          })}
          {showCreate && (
            <DropdownMenuCheckboxItem
              checked={false}
              onCheckedChange={() => {
                onChange([...selected, searchQuery.trim()]);
                setSearchQuery("");
              }}
              className="text-brand font-medium italic"
            >
              Create "{searchQuery.trim()}"
            </DropdownMenuCheckboxItem>
          )}
          {filteredOptions.length === 0 && !showCreate && (
            <div className="p-2 text-sm text-center text-muted-foreground">
              No options found.
            </div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
