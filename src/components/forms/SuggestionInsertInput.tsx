
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
    
    console.log('🔧 [SuggestionInput] Input changed:', {
      value: newValue,
      showSuggestions: true,
      filteredCount: filteredSuggestions.length
    });
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    console.log('🔧 [SuggestionInput] Key pressed:', {
      key: e.key,
      showSuggestions,
      selectedIndex,
      filteredCount: filteredSuggestions.length
    });

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      
      // Show dropdown if not visible
      if (!showSuggestions) {
        setShowSuggestions(true);
        setSelectedIndex(0);
        console.log('🔧 [SuggestionInput] ArrowDown - Opening dropdown');
        return;
      }
      
      // Navigate down
      const newIndex = selectedIndex < filteredSuggestions.length - 1 ? selectedIndex + 1 : selectedIndex;
      setSelectedIndex(newIndex);
      console.log('🔧 [SuggestionInput] ArrowDown - New index:', newIndex);
      
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      
      // Navigate up
      const newIndex = selectedIndex > 0 ? selectedIndex - 1 : -1;
      setSelectedIndex(newIndex);
      console.log('🔧 [SuggestionInput] ArrowUp - New index:', newIndex);
      
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < filteredSuggestions.length) {
        const selectedValue = filteredSuggestions[selectedIndex];
        setValue(selectedValue);
        onChange(selectedValue);
        onEnter(selectedValue);
        setShowSuggestions(false);
        setSelectedIndex(-1);
        console.log('🔧 [SuggestionInput] Enter - Selected:', selectedValue);
      } else if (value.trim()) {
        onEnter(value.trim());
        console.log('🔧 [SuggestionInput] Enter - Current value:', value.trim());
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setSelectedIndex(-1);
      console.log('🔧 [SuggestionInput] Escape - Closing dropdown');
    } else if (e.key === 'Home') {
      e.preventDefault();
      if (showSuggestions && filteredSuggestions.length > 0) {
        setSelectedIndex(0);
        console.log('🔧 [SuggestionInput] Home - First item selected');
      }
    } else if (e.key === 'End') {
      e.preventDefault();
      if (showSuggestions && filteredSuggestions.length > 0) {
        setSelectedIndex(filteredSuggestions.length - 1);
        console.log('🔧 [SuggestionInput] End - Last item selected');
      }
    }
  };

  const handleSuggestionClick = (suggestion: string, index: number) => {
    console.log('🔧 [SuggestionInput] Suggestion clicked:', { suggestion, index });
    
    setValue(suggestion);
    onChange(suggestion);
    onEnter(suggestion);
    
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
    console.log('🔧 [SuggestionInput] Input focused - showing suggestions');
  };

  const handleDropdownToggle = () => {
    const newShowState = !showSuggestions;
    setShowSuggestions(newShowState);
    setSelectedIndex(-1);
    
    console.log('🔧 [SuggestionInput] Dropdown toggled:', newShowState);
    
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
          {filteredSuggestions.map((suggestion, index) => (
            <div
              key={index}
              className={`px-3 py-2 cursor-pointer hover:bg-accent hover:text-accent-foreground ${
                index === selectedIndex ? 'bg-accent text-accent-foreground' : ''
              }`}
              onMouseDown={(e) => handleDropdownMouseDown(e, suggestion, index)}
              onMouseEnter={() => setSelectedIndex(index)}
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
