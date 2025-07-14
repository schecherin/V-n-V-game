import React from 'react';
import { Menu } from 'lucide-react';
import Button from '@/components/ui/Button';

interface MobileHeaderProps {
  roomName: string;
  onOpenMenu: () => void;
}

const MobileHeader: React.FC<MobileHeaderProps> = ({ roomName, onOpenMenu }) => {
  return (
    <header className="relative z-20 flex items-center justify-between p-3 bg-[var(--color-text-brown-dark)] border-b-2 border-[var(--color-border-gold)]/70 shadow-sm">
      <h1 className="text-lg font-semibold text-[var(--color-bg-cream-light)] truncate">{roomName}</h1>
      <Button variant="ghost" size="icon" aria-label="Menu" onClick={onOpenMenu} className="text-[var(--color-bg-cream-light)] hover:bg-[var(--color-border-gold)]/30"><Menu className="h-6 w-6" /></Button>
    </header>
  );
};
export default MobileHeader;