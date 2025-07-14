import React from 'react';

const variantsConfig = {
    default: "bg-accent-gold text-brown-dark hover:bg-gold shadow-md",
    destructive: "bg-red-600 text-[var(--color-bg-cream)] hover:bg-red-700 shadow",
    outline: "border border-gold text-gold hover:bg-gold hover:text-brown-dark",
    secondary: "bg-brown-dark text-cream hover:bg-brown-medium",
    ghost: "hover:bg-gold/20 text-brown-medium hover:text-brown-dark",
    link: "underline-offset-4 hover:underline text-[var(--color-accent-gold)]",
    cream: "bg-cream-light text-brown-dark border border-gold/50 hover:bg-cream hover:border-gold shadow-sm",
    creamOutlineGold: "bg-cream-light text-brown-dark border-2 border-accent-gold hover:bg-cream hover:border-gold shadow-sm",
};

const sizesConfig = {
    default: "h-10 py-2 px-4",
    sm: "h-9 px-3 rounded-md",
    lg: "h-11 px-8 rounded-md",
    icon: "h-10 w-10",
};

type ButtonVariant = keyof typeof variantsConfig;
type ButtonSize = keyof typeof sizesConfig;

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    variant?: ButtonVariant;
    size?: ButtonSize;
    className?: string;
}

const Button: React.FC<ButtonProps> = ({
    children,
    variant = 'default',
    size = 'default',
    className = '',
    ...props
}) => {
  const baseStyle = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-gold)] focus-visible:ring-offset-2 disabled:opacity-60 disabled:pointer-events-none ring-offset-[var(--color-bg-cream)]";
  
  const variantClass = variantsConfig[variant];
  const sizeClass = sizesConfig[size];

  return (
    <button className={`${baseStyle} ${variantClass} ${sizeClass} ${className}`} {...props}>
      {children}
    </button>
  );
};
export default Button;