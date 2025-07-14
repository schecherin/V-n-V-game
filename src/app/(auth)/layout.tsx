export default function AuthLayout({
  children,
}: {
  children?: React.ReactNode;
}) {
  return (
    <div className="w-full min-h-[100dvh] flex justify-center items-center">
      <div className="-translate-y-1/2">{children}</div>
    </div>
  );
}
