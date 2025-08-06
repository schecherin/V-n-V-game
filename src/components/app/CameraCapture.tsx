"use client";

import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface CameraCaptureProps {
  onCapture: (imageBlob: Blob) => void;
}

export default function CameraCapture({
  onCapture,
}: Readonly<CameraCaptureProps>) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);

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

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext("2d");

    if (context) {
      // Set canvas size to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw video frame to canvas
      context.drawImage(video, 0, 0);

      // Convert to blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            stopCamera();
            onCapture(blob);
          }
        },
        "image/jpeg",
        0.8
      );
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
          Open Camera
        </button>
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
            className="w-full rounded-lg scale-x-[-1]"
          />
          <canvas ref={canvasRef} className="hidden" />

          <div className="flex gap-4 mt-4 justify-center">
            {!stream ? (
              <button
                onClick={startCamera}
                disabled={!!stream}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                Start Camera
              </button>
            ) : (
              <button
                onClick={capturePhoto}
                disabled={!stream}
                className="w-16 h-16 bg-white rounded-full border-4 border-gray-300 hover:border-gray-400 transition-colors flex items-center justify-center shadow-lg"
              >
                <div className="w-12 h-12 bg-white rounded-full border-2 border-gray-400"></div>
              </button>
            )}
            <button
              onClick={() => {
                stopCamera();
              }}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
