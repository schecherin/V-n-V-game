import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Player } from "@/types";

interface PlayerAvatarProps {
  player: Player;
  size?: "sm" | "md" | "lg";
  showName?: boolean;
  className?: string;
  nameClassName?: string;
}

export function PlayerAvatar({
  player,
  size = "md",
  showName = true,
  className = "",
  nameClassName = "",
}: PlayerAvatarProps) {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-14 h-14",
  };

  const textSizes = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Avatar className={sizeClasses[size]}>
        <AvatarImage
          src={player.avatar_url || undefined}
          alt={player.player_name}
          className="object-cover"
        />
        <AvatarFallback className={`${textSizes[size]} font-semibold`}>
          {player.player_name.charAt(0)}
        </AvatarFallback>
      </Avatar>
      {showName && (
        <span className={`font-medium ${textSizes[size]} ${nameClassName}`}>
          {player.player_name}
        </span>
      )}
    </div>
  );
}
