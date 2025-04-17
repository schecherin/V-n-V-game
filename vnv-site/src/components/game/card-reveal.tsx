'use client';

import { motion, useAnimation } from 'framer-motion';
import { useRouter } from "next/navigation";
import { useEffect } from 'react';

export default function CardReveal() {
  const controls = useAnimation();
  const router = useRouter();

  useEffect(() => {
    // Initial fall + spin animation
    controls.start({
      y: [-800, 0],
      rotateY: 1440,
      opacity: 1,
      transition: {
        y: { values: [-500, 0], duration: 2, ease: "easeIn" },
        rotateY: { delay: 0 , duration: 2, ease: "easeIn" },
        opacity: { duration: 0.2 }
      }
    }).then(() => {
      controls.start({
        y: [0, -10, 0],
        transition: {
          duration: 0.5,
          ease: "easeInOut"
        }
      });
    });
  }, [controls]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <motion.div
        initial={{ y: 0, rotateY: 0, opacity: 0 }}
        animate={controls}
        style={{ transformStyle: 'preserve-3d' }}
        className="w-64 h-96 relative"
      >
        <div className="w-full h-full relative" style={{ transformStyle: 'preserve-3d' }}>
          {/* Back */}
          <div
            className="absolute inset-0"
            style={{
              transform: 'rotateY(180deg)',
              backfaceVisibility: 'hidden'
            }}
          >
            <img
              src="/card-back.png"
              alt="Card back"
              className="w-full h-full object-cover rounded-lg shadow-lg"
            />
          </div>

          {/* Front */}
          <div
            className="absolute inset-0"
            style={{
              transform: 'rotateY(0deg)',
              backfaceVisibility: 'hidden'
            }}
          >
            <img
              src="/card-image.png"
              alt="Card front"
              className="w-full h-full object-cover rounded-lg shadow-lg"
            />
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 0.75 }}
              transition={{ delay: 2, duration: 1.5, ease: 'easeInOut' }}
              className="w-full p-4 bg-black bg-opacity-70 text-white text-center absolute bottom-0"
            >
              <p className="text-sm">Role</p>
              <p className="text-sm">Role Description</p>
            </motion.div>
          </div>
        </div> 
      </motion.div>
      <button className="mt-6 px-6 py-2 bg-gray-200 border border-black rounded hover:bg-gray-300 transition" 
        onClick={() => router.push("/game")} > {/* This will send us to the actual game, menu for which should be clarified further*/}
        Confirm
      </button> 
    </div>
  );
}
