import React from "react";
import Button from "@/components/ui/Button";
import { useGameContext } from "@/app/[game_id]/layout";

interface TutorialProps {
  onNextPhase: () => void;
}

const Tutorial: React.FC<TutorialProps> = ({ onNextPhase }) => {
  const { currentPlayerIsHost } = useGameContext();

  return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-8">
      <div className="max-w-2xl mx-auto text-center">
        <h1 className="text-4xl font-bold text-brown-dark mb-8">Tutorial</h1>

        <div className="bg-cream-light rounded-lg p-8 shadow-lg mb-8">
          <p className="text-xl text-brown-dark mb-6">
            This is the tutorial page
          </p>

          <div className="text-left text-brown-dark space-y-4">
            <p>
              Welcome to Vices & Virtues! This tutorial will help you understand
              the game mechanics.
            </p>
            <p>
              In this game, you'll take on different roles with unique abilities
              and work with other players to achieve your faction's goals.
            </p>
            <p>
              The tutorial will guide you through the basic concepts before the
              main game begins.
            </p>
          </div>
        </div>

        {currentPlayerIsHost && (
          <Button
            onClick={onNextPhase}
            className="px-8 py-3 text-lg font-semibold"
          >
            Continue to Next Phase
          </Button>
        )}

        {!currentPlayerIsHost && (
          <p className="text-brown-medium italic">
            Waiting for the host to continue...
          </p>
        )}
      </div>
    </div>
  );
};

export default Tutorial;
