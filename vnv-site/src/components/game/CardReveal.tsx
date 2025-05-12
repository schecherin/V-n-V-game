'use client';

import { motion, useAnimation } from 'framer-motion';
import { useRouter, useParams } from "next/navigation"; // Import useParams
import { useEffect, useState } from 'react';

export default function CardReveal() {
  const controls = useAnimation();
  const router = useRouter();
  const params = useParams(); // Use useParams to get path parameters

  const gameId = 1 //params.gameId as string; // Get gameId from the path

  // State for dynamic role data
  // BACKEND INTEGRATION POINT: Fetch the assigned role, description, and card image
  // for the current player for THIS gameId from the backend.
  const [roleName, setRoleName] = useState("Calculating Destiny..."); // Placeholder
  const [roleDescription, setRoleDescription] = useState("Your fate is being sealed. Stand by."); // Placeholder
  const [cardFrontImage, setCardFrontImage] = useState("/card-image.png"); // Default/Placeholder (e.g. a generic "question mark" card)
  const [isReadyToProceed, setIsReadyToProceed] = useState(false);

  useEffect(() => {
    if (gameId) {
      // BACKEND INTEGRATION:
      // Simulate fetching role details after a short delay
      // Replace this with actual API call: fetch(`/api/game/${gameId}/my-role`)
      // The API should return { roleName, description, image } for the current authenticated user in this game.
      console.log(`Fetching role for gameId: ${gameId}`);
      setTimeout(() => {
        // Mock data - replace with actual fetched data
        const fetchedRoleName = "The Strategist"; // Example
        const fetchedRoleDescription = "You see the threads of fate. Guide your team to victory with cunning plans.";
        const fetchedCardImage = "/roles/strategist.png"; // Example: ensure this image exists in /public/roles/

        setRoleName(fetchedRoleName);
        setRoleDescription(fetchedRoleDescription);
        setCardFrontImage(fetchedCardImage); // Make sure this path is correct relative to the `public` folder
      }, 1500); // Simulate network delay
    }

    // Animation sequence
    controls.start({
      y: [-800, 0],
      rotateY: 360 * 4, // Multiple spins
      opacity: 1,
      transition: {
        y: { duration: 1.5, ease: "easeOut" },
        rotateY: { duration: 2, ease: "linear" }, // Linear for smoother continuous spin
        opacity: { duration: 0.1 }
      }
    }).then(() => {
      // Slight bounce effect after landing
      controls.start({
        y: [0, -20, 0], // Bounce up and settle
        transition: {
          duration: 0.6,
          ease: "easeInOut",
          delay: 0.1,
        }
      }).then(() => {
        setIsReadyToProceed(true); // Allow proceeding after animation completes
      });
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameId]); // Rerun if gameId changes (though typically it won't on this page)
                // Removed 'controls' from dependency array as it's stable

  const handleConfirm = () => {
    if (!gameId) {
      alert("Error: Game ID is missing. Cannot proceed.");
      router.push("/"); // Redirect to home or a general game listing page
      return;
    }
    // Navigate to the main game play page for the specific gameId
    // The 'game_play_page' immersive artifact is at /game/[gameId]/play
    router.push(`/game/play`);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-[rgb(255,255,255)] via-slate-700 to-black text-white p-4 overflow-hidden font-sans">
      <h2 className="text-3xl sm:text-4xl font-bold text-sky-300 mb-10 animate-pulse">Your Role is Revealed...</h2>
      <motion.div
        initial={{ y: -800, rotateY: 0, opacity: 0 }}
        animate={controls}
        style={{
          transformStyle: 'preserve-3d',
          perspective: '1000px'
        }}
        className="w-72 h-[26rem] md:w-80 md:h-[28rem] relative cursor-pointer" // Adjusted size
      >
        <div className="w-full h-full relative" style={{ transformStyle: 'preserve-3d' }}>
          {/* Back Face */}
          <div
            className="absolute inset-0 rounded-xl overflow-hidden shadow-2xl border-2 border-slate-600"
            style={{
              transform: 'rotateY(180deg)',
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
            }}
          >
            <img
              src="/card-back.png" // Ensure this image exists in /public
              alt="Card back"
              className="w-full h-full object-cover"
              onError={(e) => (e.currentTarget.src = 'https://placehold.co/320x448/334155/64748B?text=Card+Back')}
            />
          </div>

          {/* Front Face */}
          <div
            className="absolute inset-0 rounded-xl overflow-hidden shadow-2xl border-2 border-amber-400"
            style={{
              transform: 'rotateY(0deg)',
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              background: 'linear-gradient(145deg, #334155, #1e293b)', // Darker slate gradient
            }}
          >
            <img
              src={cardFrontImage}
              alt={roleName || "Role image"}
              className="w-full h-2/3 object-contain pt-4 px-4" // Image takes top part
              onError={(e) => (e.currentTarget.src = `https://placehold.co/320x300/475569/94A3B8?text=${roleName.charAt(0)}`)}
            />
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={isReadyToProceed ? { y: 0, opacity: 1 } : { opacity: 0 }}
              transition={{ delay: 0.5, duration: 0.8, ease: 'easeOut' }} // Text fades in after card settles
              className="absolute bottom-0 left-0 right-0 p-4 h-1/3 bg-black/60 text-white text-center rounded-b-xl flex flex-col justify-center"
            >
              <p className="text-xl font-bold mb-1 text-amber-300">{roleName}</p>
              <p className="text-sm text-slate-300 leading-tight">{roleDescription}</p>
            </motion.div>
          </div>
        </div>
      </motion.div>

      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={isReadyToProceed ? { opacity: 1, y: 0 } : { opacity: 0 }}
        transition={{ delay: 1.0, duration: 0.5 }} // Button appears after text
        className="mt-12 px-8 py-3 bg-green-600 hover:bg-green-500 text-white font-semibold rounded-lg shadow-xl transition duration-200 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-75 disabled:opacity-60 disabled:cursor-not-allowed"
        onClick={() => router.push("/game/play")}
        disabled={!isReadyToProceed || roleName === "Calculating Destiny..."} // Also disable if role hasn't "loaded"
      >
        Continue
      </motion.button>
    </div>
  );
}
