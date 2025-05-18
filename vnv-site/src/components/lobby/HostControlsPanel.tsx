
import React from 'react';
import Button from '../ui/Button';
import Switch from '../ui/Switch';
import { PhaseSwitch } from '@/lib/mockData';

interface HostControlsPanelProps {
    isHost: boolean;
    onStartGame: () => void;
    canStartGame: boolean;
    phaseSwitches: PhaseSwitch[];
    onPhaseChange: (id: string, value: boolean) => void;
}

const HostControlsPanel: React.FC<HostControlsPanelProps> = ({ isHost, onStartGame, canStartGame, phaseSwitches, onPhaseChange }) => {
  if (!isHost) { return (<div className="p-6 text-center text-[var(--color-text-brown-medium)] bg-[var(--color-bg-cream)] h-full flex items-center justify-center"><p>Waiting for the host to start the game...</p></div>); }
  return (
    <div className="p-4 bg-[var(--color-bg-cream)]">
      <h3 className="text-base font-semibold text-[var(--color-text-brown-dark)] mb-1">Host Controls</h3>
      <div className="bg-[var(--color-bg-cream-light)] p-3 rounded-lg shadow">
        {phaseSwitches.map(ps => (<Switch key={ps.id} id={ps.id} checked={ps.checked} onChange={(value: boolean) => onPhaseChange(ps.id, value)} label={ps.label}/>))}
      </div>
      <div className="mt-6"><Button onClick={onStartGame} disabled={!canStartGame} className="w-full text-lg py-3 font-semibold">Start Game</Button></div>
    </div>
  );
};
export default HostControlsPanel;