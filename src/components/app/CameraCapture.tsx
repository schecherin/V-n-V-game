"use client";

import { useState, useRef } from "react";

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
    <div className="camera-capture">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="w-full max-w-sm rounded-lg"
      />
      <canvas ref={canvasRef} className="hidden" />

      <div className="flex gap-4 mt-4">
        <button
          onClick={startCamera}
          disabled={!!stream}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Start Camera
        </button>
        <button
          onClick={capturePhoto}
          disabled={!stream}
          className="px-4 py-2 bg-green-500 text-white rounded"
        >
          Take Photo
        </button>
        <button
          onClick={() => {
            stopCamera();
          }}
          className="px-4 py-2 bg-gray-500 text-white rounded"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
