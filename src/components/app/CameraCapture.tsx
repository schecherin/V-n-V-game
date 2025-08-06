"use client";

import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface CameraCaptureProps {
  onCapture: (imageBlob: Blob) => void;
}

export default function CameraCapture({
  onCapture,
}: Readonly<CameraCaptureProps>) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [videoReady, setVideoReady] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [hasCaptured, setHasCaptured] = useState(false);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user", // Front camera
          width: { ideal: 400 },
          height: { ideal: 400 },
        },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      // Handle permission denied or no camera
    }
  };

  const handleVideoReady = () => {
    setVideoReady(true);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current || !videoReady) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext("2d");

    if (context) {
      const videoWidth = video.videoWidth;
      const videoHeight = video.videoHeight;
      const cropSize = Math.min(videoWidth, videoHeight);
      const cropX = (videoWidth - cropSize) / 2;
      const cropY = (videoHeight - cropSize) / 2;

      const outputSize = 400;
      canvas.width = outputSize;
      canvas.height = outputSize;

      // Create circular clipping path
      context.beginPath();
      context.arc(
        outputSize / 2,
        outputSize / 2,
        outputSize / 2,
        0,
        Math.PI * 2
      );
      context.clip();

      // Draw the image
      context.drawImage(
        video,
        cropX,
        cropY,
        cropSize,
        cropSize,
        0,
        0,
        outputSize,
        outputSize
      );

      canvas.toBlob(
        (blob) => {
          if (blob) {
            setHasCaptured(true);
            onCapture(blob);
          }
        },
        "image/png",
        0.9
      ); // Use PNG for transparency
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setVideoReady(false);
  };

  const handleDialogOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (open) {
      // Start camera when dialog opens
      setHasCaptured(false);
      startCamera();
    } else {
      // Stop camera when dialog closes
      stopCamera();
    }
  };

  const handleRetake = () => {
    setHasCaptured(false);
    // Restart camera if it was stopped
    if (!stream) {
      startCamera();
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
      <DialogTrigger asChild>
        <Button variant="default">Open Camera</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Take a Photo</DialogTitle>
        </DialogHeader>
        <div className="camera-capture">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            onLoadedMetadata={handleVideoReady}
            className="w-full rounded-lg scale-x-[-1]"
          />
          <canvas ref={canvasRef} className="hidden" />

          <div className="flex gap-4 mt-4 justify-center">
            {hasCaptured ? (
              <>
                <Button onClick={handleRetake} variant="default">
                  Retake
                </Button>
                <Button
                  onClick={() => {
                    setIsDialogOpen(false);
                  }}
                  variant="default"
                  className="bg-green-500 hover:bg-green-600"
                >
                  Use Photo
                </Button>
              </>
            ) : (
              <>
                {stream && videoReady ? (
                  <button
                    onClick={capturePhoto}
                    className="w-16 h-16 bg-white rounded-full border-4 border-gray-300 hover:border-gray-400 transition-colors flex items-center justify-center shadow-lg"
                  >
                    <div className="w-12 h-12 bg-white rounded-full border-2 border-gray-400"></div>
                  </button>
                ) : (
                  <div className="w-16 h-16 bg-gray-200 rounded-full border-4 border-gray-300 flex items-center justify-center">
                    <div className="w-8 h-8 bg-gray-400 rounded-full animate-pulse"></div>
                  </div>
                )}
                <Button
                  onClick={() => {
                    setIsDialogOpen(false);
                  }}
                  variant="secondary"
                >
                  Cancel
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
