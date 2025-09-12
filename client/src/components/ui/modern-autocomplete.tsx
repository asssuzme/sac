import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, Search, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface Option {
  value: string;
  label: string;
  category?: string;
}

interface ModernAutocompleteProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  className?: string;
  error?: boolean;
  allowCustom?: boolean;
  customPlaceholder?: string;
}

export function ModernAutocomplete({
  options,
  value,
  onChange,
  placeholder = "Select or type...",
  icon,
  disabled = false,
  className,
  error = false,
  allowCustom = true,
  customPlaceholder = "Type custom value and press Enter"
}: ModernAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [hoveredIndex, setHoveredIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Filter options based on search
  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(search.toLowerCase()) ||
    option.value.toLowerCase().includes(search.toLowerCase())
  );

  // Group options by category
  const groupedOptions = filteredOptions.reduce((acc, option) => {
    const category = option.category || "All";
    if (!acc[category]) acc[category] = [];
    acc[category].push(option);
    return acc;
  }, {} as Record<string, Option[]>);

  // Get display label for current value
  const getDisplayLabel = () => {
    const option = options.find(opt => opt.value === value);
    return option ? option.label : value;
  };

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearch("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!isOpen && (e.key === "Enter" || e.key === " " || e.key === "ArrowDown")) {
      e.preventDefault();
      setIsOpen(true);
      return;
    }

    if (!isOpen) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHoveredIndex(prev => 
          prev < filteredOptions.length - 1 ? prev + 1 : 0
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHoveredIndex(prev => 
          prev > 0 ? prev - 1 : filteredOptions.length - 1
        );
        break;
      case "Enter":
        e.preventDefault();
        if (hoveredIndex >= 0 && hoveredIndex < filteredOptions.length) {
          const option = filteredOptions[hoveredIndex];
          onChange(option.value);
          setIsOpen(false);
          setSearch("");
          setHoveredIndex(-1);
        } else if (allowCustom && search) {
          onChange(search);
          setIsOpen(false);
          setSearch("");
          setHoveredIndex(-1);
        }
        break;
      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        setSearch("");
        setHoveredIndex(-1);
        break;
    }
  }, [isOpen, filteredOptions, hoveredIndex, onChange, allowCustom, search]);

  // Scroll to hovered item
  useEffect(() => {
    if (hoveredIndex >= 0 && listRef.current) {
      const items = listRef.current.querySelectorAll('[data-option]');
      const item = items[hoveredIndex] as HTMLElement;
      if (item) {
        item.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [hoveredIndex]);

  const handleSelect = (option: Option) => {
    onChange(option.value);
    setIsOpen(false);
    setSearch("");
    setHoveredIndex(-1);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
    setSearch("");
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      {/* Input Field */}
      <div 
        className={cn(
          "relative flex items-center gap-2 px-3 py-2.5 rounded-lg border-2 transition-all duration-200 cursor-pointer",
          "bg-background hover:bg-muted/50",
          isOpen ? "border-primary ring-4 ring-primary/10" : "border-input hover:border-primary/50",
          error && "border-destructive hover:border-destructive",
          disabled && "opacity-50 cursor-not-allowed pointer-events-none"
        )}
        onClick={() => !disabled && setIsOpen(true)}
      >
        {icon && (
          <div className="text-muted-foreground flex-shrink-0">
            {icon}
          </div>
        )}
        
        {isOpen ? (
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground"
            autoFocus
            disabled={disabled}
          />
        ) : (
          <div className="flex-1 text-sm">
            {value ? (
              <span className="text-foreground">{getDisplayLabel()}</span>
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </div>
        )}

        <div className="flex items-center gap-1 flex-shrink-0">
          {value && !isOpen && (
            <button
              onClick={handleClear}
              className="p-1 rounded hover:bg-muted transition-colors"
              type="button"
            >
              <X className="h-3 w-3 text-muted-foreground" />
            </button>
          )}
          <ChevronDown 
            className={cn(
              "h-4 w-4 text-muted-foreground transition-transform duration-200",
              isOpen && "rotate-180"
            )}
          />
        </div>
      </div>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute z-50 w-full mt-2 bg-popover border-2 border-border rounded-lg shadow-xl overflow-hidden"
          >
            {/* Search Header */}
            <div className="p-2 border-b bg-muted/30">
              <div className="flex items-center gap-2 px-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  {filteredOptions.length} results
                  {search && ` for "${search}"`}
                </span>
              </div>
            </div>

            {/* Options List */}
            <div 
              ref={listRef}
              className="max-h-[320px] overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-muted-foreground/20"
            >
              {filteredOptions.length > 0 ? (
                Object.entries(groupedOptions).map(([category, categoryOptions]) => (
                  <div key={category}>
                    {Object.keys(groupedOptions).length > 1 && (
                      <div className="px-3 py-1.5 text-xs font-medium text-muted-foreground bg-muted/30 sticky top-0 backdrop-blur-sm">
                        {category}
                      </div>
                    )}
                    {categoryOptions.map((option, index) => {
                      const globalIndex = filteredOptions.indexOf(option);
                      return (
                        <motion.div
                          key={option.value}
                          data-option
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.02 }}
                          className={cn(
                            "flex items-center justify-between px-3 py-2.5 cursor-pointer transition-all duration-150",
                            "hover:bg-primary/10 hover:pl-4",
                            globalIndex === hoveredIndex && "bg-primary/10 pl-4",
                            value === option.value && "bg-primary/5"
                          )}
                          onClick={() => handleSelect(option)}
                          onMouseEnter={() => setHoveredIndex(globalIndex)}
                        >
                          <span className={cn(
                            "text-sm",
                            value === option.value && "font-medium text-primary"
                          )}>
                            {option.label}
                          </span>
                          {value === option.value && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: "spring", stiffness: 500 }}
                            >
                              <Check className="h-4 w-4 text-primary" />
                            </motion.div>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                ))
              ) : (
                <div className="p-4 text-center">
                  <p className="text-sm font-medium text-muted-foreground">
                    No results found
                  </p>
                  {allowCustom && search && (
                    <motion.button
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      type="button"
                      onClick={() => {
                        onChange(search);
                        setIsOpen(false);
                        setSearch("");
                      }}
                      className="mt-3 px-4 py-2 bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors"
                    >
                      <span className="text-sm text-primary">
                        Use "{search}" as custom value
                      </span>
                    </motion.button>
                  )}
                  {!allowCustom && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Try a different search term
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Footer hint */}
            {allowCustom && filteredOptions.length > 0 && (
              <div className="px-3 py-2 border-t bg-muted/30">
                <p className="text-xs text-muted-foreground">
                  ↑↓ Navigate • Enter to select • Type for custom
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}