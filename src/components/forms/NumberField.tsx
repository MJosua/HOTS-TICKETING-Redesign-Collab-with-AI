import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';

interface NumberFieldProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  readonly?: boolean;
  maxValue?: number;
  rounding?: number | false;
}

export const NumberField: React.FC<NumberFieldProps> = ({
  value,
  onChange,
  placeholder,
  readonly,
  maxValue,
  rounding
}) => {
  const formatNumber = (num: string | number | null | undefined) => {
    if (num === null || num === undefined || num === "") return "";
    const numStr = typeof num === 'number' ? num.toString() : num;
    return numStr.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const handleNumberChange = (inputValue: string) => {
    const raw = inputValue.replace(/,/g, ""); // remove commas before parsing
    let numVal = Number(raw);

    if (!isNaN(numVal)) {
      if (maxValue !== undefined && numVal > maxValue) {
        numVal = maxValue;
      }

      if (rounding) {
        numVal = Math.max(
          rounding,
          Math.round(numVal / rounding) * rounding
        );
      }

      onChange(numVal.toString()); // pass numeric value upward
      return formatNumber(numVal); // formatted for display
    }

    onChange(""); // invalid → clear
    return "";
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const formatted = handleNumberChange(e.target.value);
    setDisplay(formatted);
  };

  const [display, setDisplay] = useState(formatNumber(value));

  useEffect(() => {
    setDisplay(formatNumber(value));
  }, [value]);

  return (
    <Input
      type="text"
      value={display}
      onChange={(e) => {
        // let user type
        setDisplay(e.target.value);
      }}
      onBlur={handleBlur}
      placeholder={placeholder}
      readOnly={readonly}
    />
  );
};
