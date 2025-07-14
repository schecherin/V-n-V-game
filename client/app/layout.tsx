// packages/client/app/layout.tsx
import './globals.css'; // Includes Tailwind directives
import { SocketProvider } from 'client/lib/socketContext';

export const metadata = {
  title: 'Vice & Virtue',
  description: 'Online social deduction game.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <SocketProvider> {/* Wrap the entire application */}
          {children}
        </SocketProvider>
      </body>
    </html>
  );
}