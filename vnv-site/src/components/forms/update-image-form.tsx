"use client";

import { Input } from "@/components/ui/input";
import { useState } from "react";

export default function UpdateImageForm() {
  const [avatar, setAvatar] = useState<string | null>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAvatar(url);
    }
  };

  return (
    <label className="cursor-pointer inline-block">
      <Input
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleUpload}
      />
      <div className="w-24 h-24 bg-gray-200 rounded-full overflow-hidden mx-auto flex items-center justify-center">
        {avatar ? (
          <img
            src={avatar}
            alt="avatar"
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-gray-500 text-3xl">👤</span>
        )}
      </div>
      <div className="text-sm mt-2 text-gray-500">Press to upload</div>
    </label>
  );
}
