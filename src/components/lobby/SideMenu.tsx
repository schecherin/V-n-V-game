
import React from 'react';
import { X, Palette, ShieldQuestion, Link2 as LinkIcon, LogOut, Info } from 'lucide-react';
import Button from '@/components/ui/Button';
import { UserGameData } from '@/lib/mockData';

interface SideMenuProps {
    isOpen: boolean;
    onClose: () => void;
    userGameData: UserGameData;
    onLeaveGameConfirm: () => void;
    onShowRoleExplanation: () => void;
}

const SideMenu: React.FC<SideMenuProps> = ({ isOpen, onClose, userGameData, onLeaveGameConfirm, onShowRoleExplanation }) => {
    const animationClasses = isOpen
        ? 'translate-x-0 opacity-100'
        : 'translate-x-full opacity-0';

    const overlayAnimationClasses = isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none';

    return (
        <div
            className={`fixed inset-0 z-50 bg-brown-dark/70 transition-opacity duration-300 ease-in-out ${overlayAnimationClasses}`}
            onClick={onClose}
        >
            <div
                className={`fixed top-0 right-0 h-full w-72 max-w-[85vw] bg-cream shadow-xl p-4 transform transition-all duration-300 ease-in-out flex flex-col border-l-2 border-gold ${animationClasses}`}
                onClick={(e: React.MouseEvent) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-4 pb-3 border-b border-gold/50">
                    <h2 className="text-xl font-semibold text-brown-dark">Menu</h2>
                    <Button variant="ghost" size="icon" onClick={onClose} className="text-brown-dark hover:bg-gold/30">
                        <X />
                    </Button>
                </div>

                <div className="mb-4 p-3 bg-cream-light rounded-md border border-gold/30">
                    <div className="mb-2">
                        <span className="text-xs text-brown-medium">Your role:</span>
                        <p className="text-sm font-semibold text-brown-dark">{userGameData.role || '***'}</p>
                    </div>
                    <Button variant="outline" size="sm" className="w-full mb-3 text-xs" onClick={onShowRoleExplanation}>
                        <Info size={14} className="mr-2"/> Role Explanation
                    </Button>
                    <div className="flex justify-between text-sm mb-1">
                        <span className="text-brown-medium">Your points:</span>
                        <span className="font-semibold text-brown-dark">{userGameData.points !== undefined ? userGameData.points : '***'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-brown-medium">Total points:</span>
                        <span className="font-semibold text-brown-dark">{userGameData.totalPoints !== undefined ? userGameData.totalPoints : '***'}</span>
                    </div>
                </div>

                <nav className="flex-grow space-y-1">
                    <Button variant="ghost" className="w-full justify-start text-left py-2.5 text-brown-dark hover:bg-gold/20"><Palette size={18} className="mr-3 flex-shrink-0"/> Theme Settings</Button>
                    <Button variant="ghost" className="w-full justify-start text-left py-2.5 text-brown-dark hover:bg-gold/20"><ShieldQuestion size={18} className="mr-3 flex-shrink-0"/> Tutorial</Button>
                    <Button variant="ghost" className="w-full justify-start text-left py-2.5 text-brown-dark hover:bg-gold/20"><LinkIcon size={18} className="mr-3 flex-shrink-0"/> Invite Friends</Button>
                </nav>

                <div className="mt-auto pt-4 border-t border-gold/50">
                     <Button variant="destructive" className="w-full justify-start py-2.5" onClick={onLeaveGameConfirm}>
                        <LogOut size={18} className="mr-3 flex-shrink-0"/> Leave Game
                     </Button>
                     <p className="text-xs text-brown-medium mt-4 text-center">v0.5.5 Final Chat Position Fix</p>
                </div>
            </div>
        </div>
    );
};
export default SideMenu;