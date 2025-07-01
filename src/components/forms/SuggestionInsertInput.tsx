
import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';

interface SuggestionInsertInputProps {
  suggestions: string[];
  placeholder?: string;
  readOnly?: boolean;
  defaultValue?: string;
  onChange: (value: string) => void;
}

export const SuggestionInsertInput: React.FC<SuggestionInsertInputProps> = ({ 
  suggestions, 
  placeholder, 
  readOnly, 
  defaultValue, 
  onChange 
}) => {
  const [inputValue, setInputValue] = useState(defaultValue || '');
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setInputValue(defaultValue || '');
  }, [defaultValue]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    onChange(value);

    if (value.length > 0) {
      const filtered = suggestions.filter(suggestion =>
        suggestion.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredSuggestions(filtered);
      setShowSuggestions(true);
      setActiveIndex(-1);
    } else {
      setShowSuggestions(false);
      setFilteredSuggestions([]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || filteredSuggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex(prev => 
          prev < filteredSuggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex(prev => 
          prev > 0 ? prev - 1 : filteredSuggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (activeIndex >= 0) {
          handleSuggestionClick(activeIndex);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setActiveIndex(-1);
        break;
    }
  };

  const handleSuggestionClick = (index: number) => {
    const selectedSuggestion = filteredSuggestions[index];
    setInputValue(selectedSuggestion);
    onChange(selectedSuggestion);
    setShowSuggestions(false);
    setActiveIndex(-1);
    inputRef.current?.focus();
  };

  const handleBlur = () => {
    // Delay hiding suggestions to allow for clicks
    setTimeout(() => {
      setShowSuggestions(false);
      setActiveIndex(-1);
    }, 150);
  };

  return (
    <div className="relative w-full">
      <Input
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        readOnly={readOnly}
        value={inputValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        autoComplete="off"
      />
      {showSuggestions && filteredSuggestions.length > 0 && (
        <ul className="absolute z-10 w-full max-h-48 overflow-auto rounded border border-gray-300 bg-white shadow-md">
          {filteredSuggestions.map((suggestion, index) => (
            <li
              key={index}
              className={`cursor-pointer px-3 py-1 hover:bg-gray-200 ${
                index === activeIndex ? 'bg-gray-300 font-semibold' : ''
              }`}
              onMouseDown={() => handleSuggestionClick(index)}
            >
              {suggestion}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
