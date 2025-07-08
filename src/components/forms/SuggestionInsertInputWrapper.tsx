import React, { useState, useEffect, KeyboardEvent } from 'react';
import { SuggestionInsertInput } from './SuggestionInsertInput';

interface SuggestionInsertInputWrapperProps {
  suggestions: string[];
  placeholder?: string;
  onAdd: (value: string) => void;
  defaultValue?: string;
}

interface SuggestionInsertInputWrapperProps {
  suggestions: string[];
  placeholder?: string;
  onAdd: (value: string) => void;
}

export const SuggestionInsertInputWrapper: React.FC<SuggestionInsertInputWrapperProps> = ({
  suggestions,
  placeholder,
  onAdd,
}) => {

  const handleAdd = (value: string) => {
    if (value.trim() !== '') {
      onAdd(value.trim());
    }
  };

  return (
    <SuggestionInsertInput
      suggestions={suggestions}
      placeholder={placeholder}
      onChange={() => {}}
      onEnter={handleAdd}
    />
  );
};
