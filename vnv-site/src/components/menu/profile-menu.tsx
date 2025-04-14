import Link from "next/link";

import UpdateImageForm from "@/components/forms/update-image-form";
import { Button } from "@/components/ui/button";

export default function ProfileMenu() {
  return (
    <div className="flex flex-col gap-y-6 items-center">
      <h1 className="text-xl font-semibold">{"<UserName>"}</h1>
      <UpdateImageForm />

      {/* USER INFO */}
      <div className="flex flex-col gap-y-3 items-start">
        <p>
          <strong>Username:</strong> PlayerOne
        </p>
        <p>
          <strong>Email:</strong> player@example.com
        </p>
        <p>
          <strong>Gems:</strong> 69
        </p>
      </div>

      {/* SIGN OUT & GO BACK */}
      <div className="flex flex-row gap-x-4">
        <Button variant="link" asChild>
          <Link href="/">← Back to menu</Link>
        </Button>
        <Button variant="destructive">Sign Out</Button>
      </div>
    </div>
  );
}
