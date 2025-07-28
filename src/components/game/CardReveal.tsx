"use client";

import { Player } from "@/types";
import { isCurrentUserHost } from "@/lib/playerApi";
import { motion, useAnimation, AnimationControls } from "framer-motion";
import { useRouter, useParams } from "next/navigation";
import React, { useEffect, useState } from "react";

interface CardRevealProps {
  roleName: string;
  roleDescription: string;
  onNextPhase: () => void;
  player: Player | undefined;
  game: any;
}

// Helper function to get role image path
const getRoleImagePath = (roleName: string): string => {
  // Convert role name to lowercase and replace spaces with hyphens for consistent file naming
  const formattedRoleName = roleName.toLowerCase().replace(/\s+/g, "-");
  return `/roles/${formattedRoleName}.png`;
};

export default function CardReveal({
  roleName,
  roleDescription,
  onNextPhase,
  player,
  game,
}: Readonly<CardRevealProps>) {
  const cardControls: AnimationControls = useAnimation();
  const infoControls: AnimationControls = useAnimation();
  const buttonControls: AnimationControls = useAnimation();
  const router = useRouter();
  const params = useParams();

  const gameId: string = params.game_id as string;

  const [cardFrontImage, setCardFrontImage] = useState("/card-image.png");
  const [isAnimationComplete, setIsAnimationComplete] = useState(false);
  const [imageError, setImageError] = useState(false);

  const currentPlayerIsHost = isCurrentUserHost(
    game,
    player?.player_id || null
  );

  // Set the role-specific image when component mounts or roleName changes
  useEffect(() => {
    if (roleName) {
      const roleImagePath = getRoleImagePath(roleName);
      setCardFrontImage(roleImagePath);
      setImageError(false); // Reset error state when new role is set
    }
  }, [roleName]);

  useEffect(() => {
    const animateScene = async () => {
      await cardControls.start({
        y: 0,
        rotateY: 360 * 3 + 180,
        opacity: 1,
        transition: {
          y: { duration: 1.1, ease: "easeOut" },
          rotateY: { duration: 1.1, ease: "linear" },
          opacity: { duration: 0.2, ease: "easeIn" },
        },
      });

      await cardControls.start({
        y: [0, -20, 0],
        rotateY: 360 * 4,
        transition: {
          y: { duration: 0.6, ease: "easeInOut", times: [0, 0.5, 1] },
          rotateY: { duration: 0.6, ease: "linear" },
        },
      });

      setIsAnimationComplete(true);

      infoControls.start({
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, ease: "easeOut", delay: 0.2 },
      });

      buttonControls.start({
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, ease: "easeOut", delay: 0.4 },
      });
    };

    animateScene();
  }, [cardControls, infoControls, buttonControls, gameId]);

  const handleConfirm = async () => {
    //we will use this for specific lobbies
    if (!gameId) {
      const messageBox = document.getElementById("message-box");
      if (messageBox) {
        messageBox.textContent = "Error: Game ID is missing.";
        messageBox.classList.remove("hidden");
        setTimeout(() => messageBox.classList.add("hidden"), 3000);
      }
      router.push("/");
      return;
    }

    onNextPhase();
  };

  // Handle image load error
  const handleImageError = () => {
    setImageError(true);
    setCardFrontImage("/card-image.png"); // Fallback to default image
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-cream text-brown-dark p-4 overflow-hidden font-sans">
      <div
        id="message-box"
        className="hidden fixed top-5 left-1/2 -translate-x-1/2 bg-red-600 text-white p-3 rounded-md shadow-lg transition-opacity duration-300 z-50"
      ></div>

      <h2 className="text-3xl sm:text-4xl font-bold text-brown-dark mb-8 text-center">
        Your Role is Revealed...
      </h2>

      {/* Card Animation Container */}
      <motion.div
        initial={{ y: -800, rotateY: 0, opacity: 0 }}
        animate={cardControls}
        style={{
          transformStyle: "preserve-3d",
          perspective: "1000px",
        }}
        className="w-72 h-[26rem] md:w-80 md:h-[28rem] relative cursor-pointer mb-8"
      >
        <div
          className="w-full h-full relative"
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* Card Back */}
          <div
            className="absolute inset-0 rounded-xl overflow-hidden shadow-2xl border-2 border-accent-gold bg-brown-medium"
            style={{
              transform: "rotateY(180deg)",
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
            }}
          >
            <img
              src="/card-back.png" // Ensure this path is correct
              alt="Card back"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Card Front - Image covers the whole front */}
          <div
            className="absolute inset-0 rounded-xl overflow-hidden shadow-2xl border-2 border-accent-gold bg-cream-light"
            style={{
              transform: "rotateY(0deg)",
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
            }}
          >
            <img
              src={cardFrontImage}
              alt={roleName}
              className="w-full h-full object-cover"
              onError={handleImageError}
            />
            {/* Optional: Show role name overlay if image fails to load */}
            {imageError && (
              <div className="absolute inset-0 flex items-center justify-center bg-cream-light">
                <p className="text-2xl font-bold text-brown-dark text-center px-4">
                  {roleName}
                </p>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Information Menu Below Card */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={infoControls}
        className="w-full max-w-md p-6 bg-cream-light rounded-xl shadow-2xl text-center mb-8 border border-gold"
      >
        <p className="text-2xl font-bold mb-2 text-accent-gold">{roleName}</p>
        <p className="text-md text-brown-dark leading-relaxed">
          {roleDescription}
        </p>
      </motion.div>

      {/* Continue Button */}
      {currentPlayerIsHost ? (
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={buttonControls}
          className="px-8 py-3 bg-accent-green hover:opacity-90 text-white font-semibold rounded-lg shadow-xl transition-all duration-200 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-accent-gold focus:ring-opacity-75 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
          onClick={handleConfirm}
          disabled={!isAnimationComplete || !gameId}
        >
          Continue
        </motion.button>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={buttonControls}
          className="text-brown-medium italic text-lg"
        >
          Waiting for the host to continue...
        </motion.div>
      )}
    </div>
  );
}
