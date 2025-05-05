
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LucideIcon } from "lucide-react";

interface AuthInputProps {
  id: string;
  label: string;
  type: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  Icon: LucideIcon;
  required?: boolean;
  rightElement?: React.ReactNode;
}

export function AuthInput({
  id,
  label,
  type,
  placeholder,
  value,
  onChange,
  Icon,
  required = false,
  rightElement
}: AuthInputProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-gray-700">{label}</Label>
      <div className="relative">
        <Icon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
        <Input
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className="pl-10 pr-10 border-gray-300 focus:border-purple-500 focus:ring-purple-500"
          required={required}
        />
        {rightElement && (
          <div className="absolute right-3 top-3">
            {rightElement}
          </div>
        )}
      </div>
    </div>
  );
}
