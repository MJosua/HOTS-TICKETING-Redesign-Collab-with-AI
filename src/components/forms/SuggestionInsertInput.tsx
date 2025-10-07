
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
  onChange = () => { },
  onEnter = () => { },
}) => {
  const [value, setValue] = useState(defaultValue);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Normalize value to string for safe filtering
    const searchValue =
      typeof value === 'string'
        ? value.toLowerCase()
        : typeof value === 'object' && value !== null
          ? (value.item_label ||
            value.name ||
            JSON.stringify(value))
            .toLowerCase()
          : '';

    if (!searchValue) {
      setFilteredSuggestions(suggestions);
    } else {
      const filtered = suggestions.filter(suggestion => {
        let text = '';

        if (typeof suggestion === 'string') {
          text = suggestion;
        } else if (Array.isArray(suggestion)) {
          // Flatten nested arrays
          text = suggestion
            .map(item => {
              if (typeof item === 'string') return item;
              if (typeof item === 'object' && item !== null)
                return (
                  item.label ||
                  item.name ||
                  JSON.stringify(item)
                );
              return '';
            })
            .join(' ');
        } else if (typeof suggestion === 'object' && suggestion !== null) {
          // Extract readable representation
          text =
            suggestion.label ||
            suggestion.name ||
            suggestion.label ||
            JSON.stringify(suggestion);
        }

        return text.toLowerCase().includes(searchValue);
      });

      setFilteredSuggestions(filtered);
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
    const newValue = e.target.value;
    setValue(newValue);
    onChange(newValue);
    setShowSuggestions(true);
    setSelectedIndex(-1);


  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {


    if (e.key === 'ArrowDown') {
      e.preventDefault();

      // Show dropdown if not visible
      if (!showSuggestions) {
        setShowSuggestions(true);
        setSelectedIndex(0);
        // console.log('🔧 [SuggestionInput] ArrowDown - Opening dropdown');
        return;
      }

      // Navigate down
      const newIndex = selectedIndex < filteredSuggestions.length - 1 ? selectedIndex + 1 : selectedIndex;
      setSelectedIndex(newIndex);
      // console.log('🔧 [SuggestionInput] ArrowDown - New index:', newIndex);

    } else if (e.key === 'ArrowUp') {
      e.preventDefault();

      // Navigate up
      const newIndex = selectedIndex > 0 ? selectedIndex - 1 : -1;
      setSelectedIndex(newIndex);
      // console.log('🔧 [SuggestionInput] ArrowUp - New index:', newIndex);

    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < filteredSuggestions.length) {

        const selectedValue = filteredSuggestions[selectedIndex];
        let text = '';

        if (typeof selectedValue === 'string') {
          text =
            selectedValue.item_name ||
            selectedValue.name ||
            JSON.stringify(selectedValue);
        } else if (Array.isArray(selectedValue)) {
          // Flatten nested arrays
          text = filteredSuggestions[selectedIndex].item_name

        } else if (typeof selectedValue === 'object' && selectedValue !== null) {
          text =
            selectedValue.item_name ||
            selectedValue.name ||
            JSON.stringify(selectedValue);
        }

        setValue(text);
        onChange(text);
        onEnter(text);
        setShowSuggestions(false);
        setSelectedIndex(-1);
        // console.log('🔧 [SuggestionInput] Enter - Selected:', selectedValue);
      } else if (value) {
        let enteredValue = '';
        if (typeof value === 'string') {
          enteredValue = value.trim();
        } else if (typeof value === 'object' && value !== null) {
          // Prefer a readable field for text input
          value.item_label || value.name || JSON.stringify(value);
        }
        if (enteredValue) {
          onEnter(enteredValue);
        }
        // console.log('🔧 [SuggestionInput] Enter - Current value:', value.trim());
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setSelectedIndex(-1);
      // console.log('🔧 [SuggestionInput] Escape - Closing dropdown');
    } else if (e.key === 'Home') {
      e.preventDefault();
      if (showSuggestions && filteredSuggestions.length > 0) {
        setSelectedIndex(0);
        // console.log('🔧 [SuggestionInput] Home - First item selected');
      }
    } else if (e.key === 'End') {
      e.preventDefault();
      if (showSuggestions && filteredSuggestions.length > 0) {
        setSelectedIndex(filteredSuggestions.length - 1);
        // console.log('🔧 [SuggestionInput] End - Last item selected');
      }
    }
  };

  const handleSuggestionClick = (suggestion: string, index: number) => {
    // console.log('🔧 [SuggestionInput] Suggestion clicked:', { suggestion, index });

    let text = '';


    if (typeof suggestion === 'string') {
      text =
        suggestion.item_name ||
        suggestion.name ||
        JSON.stringify(suggestion);
    } else if (Array.isArray(suggestion)) {
      // Flatten nested arrays
      text = suggestion[index].item_name

    } else if (typeof suggestion === 'object' && suggestion !== null) {
      text =
        suggestion.item_name ||
        suggestion.name ||
        JSON.suggestion(selectedValue);
    }


    setValue(text);
    onChange(text);
    onEnter(text);

    // Close dropdown immediately
    setShowSuggestions(false);
    setSelectedIndex(-1);

    // Focus back to input
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  const handleInputFocus = () => {
    setShowSuggestions(true);
    // console.log('🔧 [SuggestionInput] Input focused - showing suggestions');
  };

  const handleDropdownToggle = () => {
    const newShowState = !showSuggestions;
    setShowSuggestions(newShowState);
    setSelectedIndex(-1);

    // console.log('🔧 [SuggestionInput] Dropdown toggled:', newShowState);

    if (newShowState) {
      inputRef.current?.focus();
    }
  };

  // Handle mousedown on dropdown items to prevent input blur but allow selection  
  const handleDropdownMouseDown = (e: React.MouseEvent, suggestion: string, index: number) => {
    // Prevent the input from losing focus
    e.preventDefault();

    // Handle the selection
    handleSuggestionClick(suggestion, index);
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
          onFocus={handleInputFocus}
          placeholder={placeholder}
          readOnly={readOnly}
          className="pr-8"
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-0 top-0 h-full px-2"
          onClick={handleDropdownToggle}
          disabled={readOnly}
        >
          <ChevronDown className="h-4 w-4" />
        </Button>
      </div>

      {showSuggestions && filteredSuggestions.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-background border border-border rounded-md shadow-lg max-h-60 overflow-auto"
        >
          {filteredSuggestions
          .map((suggestion, index) => {
            const label =
          typeof suggestion === "string"
          ? suggestion
          : suggestion.item_name || JSON.stringify(suggestion);

          return (
          <div
            key={index}
            onMouseDown={(e) => handleDropdownMouseDown(e, suggestion, index)}
            className={`px-3 py-2 cursor-pointer hover:bg-accent ${index === selectedIndex ? 'bg-accent text-accent-foreground' : ''
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
