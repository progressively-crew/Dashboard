import { Label } from "./Label";
import { RawSwitch } from "./RawSwitch";

export interface SwitchProps {
  label?: string;
  checked: boolean;
  form?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  type?: "button" | "submit";
  id: string;
}

export const Switch = ({
  label,
  checked,
  form,
  onClick,
  type = "submit",
  id,
}: SwitchProps) => {
  return (
    <div className="flex items-center space-x-2">
      <Label htmlFor={id} aria-hidden>
        {label}
      </Label>
      <RawSwitch
        id={id}
        checked={checked}
        aria-label={label}
        type={type}
        form={form}
        onClick={onClick}
      />
    </div>
  );
};
