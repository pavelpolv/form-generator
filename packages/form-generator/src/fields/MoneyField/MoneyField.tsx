import { ChangeEvent, FC, memo, useMemo, useCallback, useState, useRef, useLayoutEffect } from 'react';
import { Input, Form } from 'antd';
import { Controller, Control, ControllerRenderProps } from 'react-hook-form';
import { MoneyField as MoneyFieldConfig, FormValues } from '@/types';
import { validateFieldConfig } from '@/validation/fieldSchemas';

/**
 * Format a number as a money string with space thousand separators and comma decimal separator
 */
function formatMoney(value: number | undefined | null, decimalPlaces: number): string {
  if (value === undefined || value === null || isNaN(value)) return '';

  const isNegative = value < 0;
  const absValue = Math.abs(value);
  const fixed = absValue.toFixed(decimalPlaces);
  const [intPart, decPart] = fixed.split('.');

  // Add space separators for thousands
  const formatted = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

  const result = decPart !== undefined ? `${formatted},${decPart}` : formatted;

  return isNegative ? `-${result}` : result;
}

/**
 * Format a raw input string with space thousand separators (integer part only)
 */
function formatWithSpaces(value: string): string {
  if (!value) return value;

  const isNegative = value.startsWith('-');
  const withoutMinus = isNegative ? value.slice(1) : value;
  const [intPart, ...rest] = withoutMinus.split(',');

  const cleanInt = intPart.replace(/\s/g, '');
  const formattedInt = cleanInt.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  const result = rest.length > 0 ? `${formattedInt},${rest.join('')}` : formattedInt;

  return isNegative ? `-${result}` : result;
}

/**
 * Parse a formatted money string back to a number
 */
function parseMoney(formatted: string): number | undefined {
  if (!formatted || formatted === '-') return undefined;

  // Remove spaces and replace comma with dot
  const cleaned = formatted.replace(/\s/g, '').replace(',', '.');
  const num = Number(cleaned);

  return isNaN(num) ? undefined : num;
}

interface MoneyFieldProps {
  config: MoneyFieldConfig
  control: Control<FormValues>
  error?: string
  disabled?: boolean
}

// Memoized inner component to use hooks with field from render prop
const MoneyInner: FC<{
  field: ControllerRenderProps<FormValues, string>
  label?: string
  placeholder?: string
  disabled: boolean
  decimalPlaces: number
  prefix?: string
  suffix?: string
  allowNegative: boolean
  min?: number
  max?: number
  error?: string
}> = memo(({ field, label, placeholder, disabled, decimalPlaces, prefix, suffix, allowNegative, min, max, error }) => {
  const [displayValue, setDisplayValue] = useState(() =>
    formatMoney(field.value as number | undefined | null, decimalPlaces),
  );
  const inputElRef = useRef<HTMLInputElement | null>(null);
  const cursorRef = useRef<number>(0);

  // Restore cursor position after React re-renders with formatted value
  useLayoutEffect(() => {
    if (inputElRef.current && document.activeElement === inputElRef.current) {
      inputElRef.current.setSelectionRange(cursorRef.current, cursorRef.current);
    }
  }, [displayValue]);

  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const inputEl = e.target;
    inputElRef.current = inputEl;
    const cursorPos = inputEl.selectionStart ?? 0;
    const raw = inputEl.value;

    // Count significant (non-space) chars before cursor in raw input
    let sigCharsBefore = 0;
    for (let i = 0; i < cursorPos && i < raw.length; i++) {
      if (raw[i] !== ' ') sigCharsBefore++;
    }

    // Filter: only digits, comma, space, and optionally minus
    const allowedPattern = allowNegative ? /[^0-9, -]/g : /[^0-9, ]/g;
    let filtered = raw.replace(allowedPattern, '');

    // Only allow minus at the beginning
    if (allowNegative) {
      const hasLeadingMinus = filtered.startsWith('-');
      filtered = (hasLeadingMinus ? '-' : '') + filtered.replace(/-/g, '');
    }

    // Only allow one comma
    const commaIndex = filtered.indexOf(',');
    if (commaIndex !== -1) {
      const beforeComma = filtered.slice(0, commaIndex + 1);
      const afterComma = filtered.slice(commaIndex + 1).replace(/,/g, '');
      filtered = beforeComma + afterComma;
    }

    // Format integer part with space separators
    const formatted = formatWithSpaces(filtered);

    // Calculate new cursor position based on significant chars count
    let newCursor = 0;
    let seen = 0;
    for (let i = 0; i < formatted.length; i++) {
      if (seen === sigCharsBefore) break;
      if (formatted[i] !== ' ') seen++;
      newCursor = i + 1;
    }
    cursorRef.current = newCursor;

    setDisplayValue(formatted);

    const parsed = parseMoney(formatted);
    if (parsed !== undefined) {
      let clamped = parsed;
      if (min !== undefined && clamped < min) clamped = min;
      if (max !== undefined && clamped > max) clamped = max;
      field.onChange(clamped);
    } else {
      field.onChange(undefined);
    }
  }, [field, allowNegative, min, max]);

  const handleBlur = useCallback(() => {
    field.onBlur();
    // Reformat display value on blur
    const numericValue = field.value as number | undefined | null;
    setDisplayValue(formatMoney(numericValue, decimalPlaces));
  }, [field, decimalPlaces]);

  return (
    <Form.Item
      label={label}
      validateStatus={error ? 'error' : undefined}
      help={error}
    >
      <Input
        ref={field.ref}
        name={field.name}
        value={displayValue}
        type="text"
        placeholder={placeholder}
        disabled={disabled}
        addonBefore={prefix}
        addonAfter={suffix}
        onChange={handleChange}
        onBlur={handleBlur}
      />
    </Form.Item>
  );
});

MoneyInner.displayName = 'MoneyInner';

/**
 * Money field component
 * Supports formatted money input with space thousand separators and comma decimal separator
 */
export const MoneyField: FC<MoneyFieldProps> = memo(({
  config,
  control,
  error,
  disabled = false,
}) => {
  // Validate config - memoized since config doesn't change after initialization
  const configError = useMemo(() => validateFieldConfig(config), [config]);
  if (configError) {
    return (
      <div style={{ color: '#ff4d4f', marginBottom: 16 }}>
        <div style={{ fontWeight: 600 }}>Невозможно отобразить поле</div>
        <div style={{ fontSize: 12, marginTop: 4 }}>{configError}</div>
      </div>
    );
  }

  const {
    name,
    label,
    placeholder,
    defaultValue,
    decimalPlaces = 2,
    prefix,
    suffix,
    allowNegative = false,
    min,
    max,
  } = config;

  return (
    <Controller
      name={name}
      control={control}
      defaultValue={defaultValue}
      render={({ field }) => (
        <MoneyInner
          field={field}
          label={label}
          placeholder={placeholder}
          disabled={disabled}
          decimalPlaces={decimalPlaces}
          prefix={prefix}
          suffix={suffix}
          allowNegative={allowNegative}
          min={min}
          max={max}
          error={error}
        />
      )}
    />
  );
});

MoneyField.displayName = 'MoneyField';
