import UserButton from "@/components/user-button";

export default function MainSiteLayout({
  children,
}: {
  children?: React.ReactNode;
}) {
  return (
    <div className="min-h-[100dvh] w-full flex justify-center items-center">
      <UserButton />
      {children}
    </div>
  );
}
