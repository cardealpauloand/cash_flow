import { useRef, useEffect, useState } from "react";
import { useField } from "@unform/core";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
} from "@/components/ui/select";

export interface UnformSelectProps {
  name: string;
  label?: string;
  placeholder?: string;
  children: React.ReactNode;
  required?: boolean;
  defaultValue?: string;
  onChangeValue?: (value: string) => void;
}

const UnformSelect = ({
  name,
  label,
  placeholder,
  children,
  required,
  defaultValue,
  onChangeValue,
}: UnformSelectProps) => {
  const hiddenRef = useRef<HTMLInputElement | null>(null);
  const { fieldName, defaultValue: dv, registerField, error } = useField(name);
  const [value, setValue] = useState<string | undefined>(
    defaultValue || (dv as string) || undefined
  );

  useEffect(() => {
    registerField({
      name: fieldName,
      ref: hiddenRef.current,
      getValue: () => value || "",
      setValue: (_ref, val: string) => setValue(val),
      clearValue: () => setValue(undefined),
    });
  }, [fieldName, registerField, value]);

  return (
    <div className="space-y-2">
      {label && (
        <Label>
          {label}
          {required && " *"}
        </Label>
      )}
      <Select
        value={value}
        onValueChange={(v) => {
          setValue(v);
          onChangeValue?.(v);
        }}
        required={required}
      >
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>{children}</SelectContent>
      </Select>
      <input type="hidden" ref={hiddenRef} defaultValue={dv as string} />
      {error && <span className="text-xs text-destructive">{error}</span>}
    </div>
  );
};

export default UnformSelect;
