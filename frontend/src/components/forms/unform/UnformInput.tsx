import { useRef, useEffect } from "react";
import { useField } from "@unform/core";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
export interface UnformInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  name: string;
  label?: string;
}
const UnformInput = ({ name, label, className, ...rest }: UnformInputProps) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const { fieldName, defaultValue, registerField, error } = useField(name);
  useEffect(() => {
    registerField({
      name: fieldName,
      ref: inputRef.current,
      getValue: (ref) => ref.value,
      setValue: (ref, value) => {
        ref.value = value;
      },
      clearValue: (ref) => {
        ref.value = "";
      },
    });
  }, [fieldName, registerField]);
  return (
    <div className="space-y-2">
      {label && <Label htmlFor={fieldName}>{label}</Label>}
      <Input
        id={fieldName}
        ref={inputRef}
        defaultValue={defaultValue}
        className={className}
        {...rest}
      />
      {error && <span className="text-xs text-destructive">{error}</span>}
    </div>
  );
};
export default UnformInput;
