import React from "react";
import {
  X,
  Palette,
  ShieldQuestion,
  Link2 as LinkIcon,
  LogOut,
  Info,
} from "lucide-react";
import Button from "@/components/ui/Button";
import { Player } from "@/types";
import { useGameContext } from "@/app/[game_id]/layout";

interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
  player: Player | undefined;
  onLeaveGameConfirm: () => void;
  onShowRoleExplanation: () => void;
}

const SideMenu: React.FC<SideMenuProps> = ({
  isOpen,
  onClose,
  player,
  onLeaveGameConfirm,
  onShowRoleExplanation,
}) => {
  const { game } = useGameContext();
  const animationClasses = isOpen
    ? "translate-x-0 opacity-100"
    : "translate-x-full opacity-0";

  const overlayAnimationClasses = isOpen
    ? "opacity-100"
    : "opacity-0 pointer-events-none";

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
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-brown-dark hover:bg-gold/30"
          >
            <X />
          </Button>
        </div>

        <div className="mb-4 p-3 bg-cream-light rounded-md border border-gold/30">
          <div className="mb-2">
            <span className="text-sm text-brown-medium">Your role:</span>
            <p className="text-lg font-semibold text-brown-dark">
              {player?.current_role_name || "***"}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="w-full mb-3 text-sm rounded-full"
            onClick={onShowRoleExplanation}
          >
            <Info size={14} className="mr-2" /> Role Explanation
          </Button>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-brown-medium">Your points:</span>
            <span className="font-semibold text-lg text-brown-dark">
              {player?.personal_points ?? "***"}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-brown-medium">Total points:</span>
            <span className="font-semibold text-lg text-brown-dark">
              {game?.group_points_pool ?? "***"}
            </span>
          </div>
        </div>

        <nav className="flex-grow space-y-1"></nav>

        <div className="mt-auto mx-auto pt-4 border-t border-gold/50">
          <Button
            variant="destructive"
            className=" justify-start py-2.5 rounded-full"
            onClick={onLeaveGameConfirm}
          >
            <LogOut size={18} className="mr-3 flex-shrink-0" /> Leave Game
          </Button>
        </div>
      </div>
    </div>
  );
};
export default SideMenu;
