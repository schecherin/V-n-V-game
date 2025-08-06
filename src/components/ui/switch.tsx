import React from "react";

interface SwitchProps {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}

const Switch: React.FC<SwitchProps> = ({ id, checked, onChange, label }) => {
  return (
    <div className="flex items-center justify-between my-3 py-2 border-b border-gold/30 last:border-b-0">
      <label
        htmlFor={id}
        className="text-sm text-brown-dark font-medium select-none pr-2"
      >
        {label}
      </label>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        id={id}
        className={`${
          checked ? "bg-accent-gold" : "bg-brown-medium/50"
        } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-accent-gold focus:ring-offset-2 ring-offset-bg-cream-light`}
      >
        <span
          aria-hidden="true"
          className={`${
            checked ? "translate-x-5" : "translate-x-0"
          } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
        />
      </button>
    </div>
  );
};
export { Switch };
