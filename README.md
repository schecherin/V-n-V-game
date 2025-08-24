# Vice and Virtue

A social deduction game where players take on different roles, each with unique abilities and objectives.

## Features

- **Multiplayer Support**: Real-time gameplay with friends
- **Role-Based Gameplay**: Multiple character roles with unique abilities
- **Progressive Web App**: Installable on mobile and desktop devices
- **Responsive Design**: Optimized for both mobile and desktop play
- **Dark Theme**: Immersive visual design with mysterious aesthetics

## Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS 4
- **Backend**: Supabase (Database, Authentication, Real-time)
- **UI Components**: Radix UI, Framer Motion
- **Deployment**: Vercel

## Prerequisites

- Node.js 18+
- npm, yarn, pnpm, or bun
- Supabase account (for backend services)

## 🔧 Getting Started

### 1. Clone the Repository

```bash
git clone schecherin/V-n-V-game
cd V-n-V-game
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

### 3. Environment Setup

Create a `.env.local` file in the root directory:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Database Setup

Run the Supabase schema setup:

```bash
# set Supabase env variable
export SUPABASE_ACCESS_TOKEN=your_supabase_access_token
npm run types
```

### 5. Start Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) to view the game.

### Game Setup

1. **Create or Join a Room**: Host a new game or join an existing one using a room code
2. **Role Assignment**: Players are randomly assigned roles (Virtue Seeker, Vice Worshipper, etc.)
3. **Game Phases**: The game progresses through multiple phases:
   - **Consultation Phase**: Players discuss and vote on actions
   - **Outreach Phase**: Use role abilities to influence the game
   - **Reflection Phase**: Review outcomes and plan next moves

## PWA Features

Vice and Virtue is a Progressive Web App that can be installed on:

- **Mobile Devices**: iOS Safari, Android Chrome
- **Desktop**: Chrome, Edge, Firefox
