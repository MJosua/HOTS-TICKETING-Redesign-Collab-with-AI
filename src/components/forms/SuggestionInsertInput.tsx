// SuggestionInsertInput.tsx
import React, { useState, useEffect, useRef, KeyboardEvent } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Check, ChevronDown } from 'lucide-react';

export interface SuggestionInsertInputProps {
  suggestions: (string | Record<string, any>)[];
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

  useEffect(() => {
    const searchValue = (value ?? "").toString().toLowerCase();

    if (!searchValue) {
      setFilteredSuggestions(suggestions as string[]);
    } else {
      const filtered = suggestions.filter(suggestion => {
        let text = '';

        if (typeof suggestion === 'string') text = suggestion;
        else if (Array.isArray(suggestion))
          text = suggestion.map(item => (typeof item === 'string' ? item : item?.label || item?.name || '')).join(' ');
        else if (typeof suggestion === 'object' && suggestion !== null)
          text = suggestion.label || suggestion.name || JSON.stringify(suggestion);

        return text.toLowerCase().includes(searchValue);
      });
      setFilteredSuggestions(filtered as string[]);
    }
    setSelectedIndex(-1);
  }, [value, suggestions]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
        setSelectedIndex(-1);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
    setShowSuggestions(true);
    setSelectedIndex(-1);
    // ❌ removed onChange(e.target.value)
    // don't notify parent on typing
  };

  const confirmSelection = (text: string) => {
    setValue(text);
    onChange(text);
    onEnter(text);
    setShowSuggestions(false);
    setSelectedIndex(-1);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!showSuggestions) setShowSuggestions(true);
      else setSelectedIndex(prev => Math.min(prev + 1, filteredSuggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < filteredSuggestions.length) {
        const suggestion = filteredSuggestions[selectedIndex];
        const label = typeof suggestion === 'string' ? suggestion : suggestion?.label || suggestion?.name || JSON.stringify(suggestion);
        confirmSelection(label);
      } else if (value.trim()) {
        confirmSelection(value.trim());
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }
  };

  const handleSuggestionClick = (suggestion: any) => {
    const label =
      typeof suggestion === 'string'
        ? suggestion
        : suggestion?.label || suggestion?.name || JSON.stringify(suggestion);
    confirmSelection(label);
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
          onClick={() => setShowSuggestions(prev => !prev)}
          disabled={readOnly}
        >
          <ChevronDown className="h-4 w-4" />
        </Button>
      </div>

      {showSuggestions && filteredSuggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-background border border-border rounded-md shadow-lg max-h-60 overflow-auto">
          {filteredSuggestions.map((suggestion, index) => {
            const label =
              typeof suggestion === 'string'
                ? suggestion
                : suggestion?.label || suggestion?.name || JSON.stringify(suggestion);

            return (
              <div
                key={index}
                onMouseDown={() => handleSuggestionClick(suggestion)}
                className={`px-3 py-2 cursor-pointer hover:bg-accent ${
                  index === selectedIndex ? 'bg-accent text-accent-foreground' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>{label}</span>
                  {index === selectedIndex && <Check className="h-4 w-4 text-primary" />}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
