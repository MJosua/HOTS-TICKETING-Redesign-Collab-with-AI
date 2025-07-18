
import React, { useState, useEffect, useRef, KeyboardEvent } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Check, ChevronDown } from 'lucide-react';

export interface SuggestionInsertInputProps {
  suggestions: string[];
  placeholder?: string;
  defaultValue?: string;
  readOnly?: boolean;
  onChange?: (value: string) => void;
  onEnter?: (value: string) => void;
}

export const SuggestionInsertInput: React.FC<SuggestionInsertInputProps> = ({
  suggestions,
  placeholder = "Type or select suggestions",
  defaultValue = "",
  readOnly = false,
  onChange = () => {},
  onEnter = () => {},
}) => {
  const [value, setValue] = useState(defaultValue);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value.trim() === '') {
      setFilteredSuggestions(suggestions);
    } else {
      const filtered = suggestions.filter(suggestion =>
        suggestion.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredSuggestions(filtered);
    }
    setSelectedIndex(-1);
  }, [value, suggestions]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    onChange(newValue);
    setShowSuggestions(true);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => 
        prev < filteredSuggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < filteredSuggestions.length) {
        const selectedValue = filteredSuggestions[selectedIndex];
        setValue(selectedValue);
        onChange(selectedValue);
        onEnter(selectedValue);
        setShowSuggestions(false);
      } else if (value.trim()) {
        onEnter(value.trim());
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    // Prevent event from bubbling up
    setValue(suggestion);
    onChange(suggestion);
    onEnter(suggestion);
    
    // Close dropdown immediately
    setShowSuggestions(false);
    setSelectedIndex(-1);
    
    // Focus back to input after a small delay to ensure dropdown is closed
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  // Handle mousedown on dropdown to prevent input blur
  const handleDropdownMouseDown = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent input from losing focus
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <Input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestions(true)}
          placeholder={placeholder}
          readOnly={readOnly}
          className="pr-8"
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-0 top-0 h-full px-2"
          onClick={() => setShowSuggestions(!showSuggestions)}
          disabled={readOnly}
        >
          <ChevronDown className="h-4 w-4" />
        </Button>
      </div>

      {showSuggestions && filteredSuggestions.length > 0 && (
        <div 
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-background border border-border rounded-md shadow-lg max-h-60 overflow-auto"
          onMouseDown={handleDropdownMouseDown}
        >
          {filteredSuggestions.map((suggestion, index) => (
            <div
              key={index}
              className={`px-3 py-2 cursor-pointer hover:bg-accent hover:text-accent-foreground ${
                index === selectedIndex ? 'bg-accent text-accent-foreground' : ''
              }`}
              onClick={() => handleSuggestionClick(suggestion)}
            >
              <div className="flex items-center justify-between">
                <span>{suggestion}</span>
                {index === selectedIndex && <Check className="h-4 w-4 text-primary" />}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
