"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import JoinRoomComponent from "@/components/lobby/JoinRoomComponent";
import CreateRoomComponent from "@/components/lobby/CreateRoomComponent";

export default function MainMenu() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex justify-center items-center" style={{ backgroundColor: '#4E3624' }}>
        <div style={{ color: '#e3b510' }}>Loading...</div>
      </div>
    }>
      <MainMenuInner />
    </Suspense>
  );
}

function MainMenuInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeComponent, setActiveComponent] = useState<
    "menu" | "join" | "create"
  >("menu");

  useEffect(() => {
    const codeFromUrl = searchParams.get("code");
    if (codeFromUrl) {
      setActiveComponent("join");
    }
  }, [searchParams]);

  const handleBackToMenu = () => {
    setActiveComponent("menu");
  };

  // Custom styles for the mysterious theme
  const pageStyle: React.CSSProperties = {
    minHeight: '100vh',
    maxHeight: '100vh',
    background: `
      radial-gradient(ellipse at top, #5a4029, #4E3624),
      linear-gradient(180deg, #4E3624 0%, #3d2a1b 100%)
    `,
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden'
  };

  const paperStyle: React.CSSProperties = {
    backgroundColor: '#ffefc5',
    backgroundImage: `
      repeating-linear-gradient(
        0deg,
        transparent,
        transparent 28px,
        rgba(139, 100, 59, 0.05) 28px,
        rgba(139, 100, 59, 0.05) 29px
      ),
      radial-gradient(ellipse at 20% 30%, rgba(139, 100, 59, 0.04) 0%, transparent 50%),
      radial-gradient(ellipse at 80% 70%, rgba(78, 54, 36, 0.03) 0%, transparent 50%),
      radial-gradient(ellipse at 10% 90%, rgba(139, 100, 59, 0.02) 0%, transparent 40%)
    `,
    border: '3px solid #e3b510',
    borderRadius: '4px',
    boxShadow: `
      0 0 40px rgba(0, 0, 0, 0.5),
      inset 0 0 40px rgba(139, 100, 59, 0.1),
      0 0 100px rgba(227, 181, 16, 0.1)
    `,
    position: 'relative' as const,
    padding: '2rem',
    maxWidth: '400px',
    width: '90%',
    margin: '0 auto'
  };

  const titleStyle: React.CSSProperties = {
    fontFamily: 'Georgia, serif',
    fontSize: '2.5rem',
    color: '#3d2a1b',
    textAlign: 'center' as const,
    marginBottom: '0.5rem',
    textShadow: '2px 2px 4px rgba(0, 0, 0, 0.2)',
    letterSpacing: '0.05em',
    fontWeight: 'bold'
  };

  const subtitleStyle: React.CSSProperties = {
    fontFamily: 'Georgia, serif',
    fontSize: '1rem',
    color: '#6b4c35',
    textAlign: 'center' as const,
    marginBottom: '2rem',
    fontStyle: 'italic',
    opacity: 0.8
  };

  const buttonStyle: React.CSSProperties = {
    width: '100%',
    padding: '1rem',
    backgroundColor: '#ffefc5',
    backgroundImage: `
      linear-gradient(180deg, rgba(255, 239, 197, 0.9), rgba(240, 220, 180, 0.9)),
      radial-gradient(ellipse at top left, rgba(139, 100, 59, 0.05) 0%, transparent 50%)
    `,
    border: '2px solid #e3b510',
    color: '#3d2a1b',
    fontSize: '1.1rem',
    fontFamily: 'Georgia, serif',
    fontWeight: 'bold',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: `
      0 4px 6px rgba(0, 0, 0, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.3)
    `,
    letterSpacing: '0.05em',
    textTransform: 'uppercase' as const,
    position: 'relative' as const
  };

  const buttonHoverStyle: React.CSSProperties = {
    ...buttonStyle,
    backgroundColor: '#e3b510',
    backgroundImage: 'none',
    color: '#2a1f15',
    transform: 'translateY(-2px)',
    boxShadow: `
      0 6px 12px rgba(0, 0, 0, 0.4),
      inset 0 1px 0 rgba(255, 255, 255, 0.4),
      0 0 20px rgba(227, 181, 16, 0.3)
    `
  };

  const inkStainStyle: React.CSSProperties = {
    position: 'absolute' as const,
    width: '60px',
    height: '40px',
    backgroundColor: 'rgba(61, 42, 27, 0.08)',
    borderRadius: '50%',
    filter: 'blur(8px)',
    pointerEvents: 'none' as const
  };

  // Floating words with their themed colors
  const floatingWords = [
    { text: 'Empathy', color: 'rgba(135, 206, 250, 0.25)' }, // Soft blue - compassion
    { text: 'Justice', color: 'rgba(227, 181, 16, 0.25)' }, // Gold - righteousness
    { text: 'Certainty', color: 'rgba(138, 93, 214, 0.25)' }, // Purple - wisdom
    { text: 'Sacrifice', color: 'rgba(255, 255, 255, 0.25)' }, // White - purity
    { text: 'Truthfulness', color: 'rgba(100, 200, 100, 0.25)' }, // Green - honesty
    { text: 'Vengeance', color: 'rgba(220, 20, 60, 0.25)' }, // Crimson - wrath
    { text: 'Murder', color: 'rgba(139, 0, 0, 0.25)' }, // Dark red - blood
    { text: 'Envy', color: 'rgba(46, 125, 50, 0.25)' }, // Dark green - jealousy
    { text: 'Deception', color: 'rgba(75, 0, 130, 0.25)' }, // Indigo - shadows
    { text: 'Deduction', color: 'rgba(255, 165, 0, 0.25)' } // Orange - clarity
  ];

  if (activeComponent === "join") {
    return (
      <main style={pageStyle} className="flex justify-center items-center p-4">
        {/* Background decorative elements */}
        <div style={{
          position: 'absolute',
          top: '10%',
          left: '5%',
          width: '100px',
          height: '100px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(227, 181, 16, 0.05) 0%, transparent 70%)',
          filter: 'blur(20px)'
        }} />
        <div style={{
          position: 'absolute',
          bottom: '15%',
          right: '10%',
          width: '150px',
          height: '150px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(227, 181, 16, 0.03) 0%, transparent 70%)',
          filter: 'blur(30px)'
        }} />
        
        {/* Floating virtue and vice names in background */}
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          overflow: 'hidden',
          pointerEvents: 'none',
          zIndex: 0
        }}>
          {floatingWords.map((word, index) => (
            <div
              key={word.text}
              style={{
                position: 'absolute',
                fontFamily: 'Georgia, serif',
                fontSize: '1.1rem',
                fontStyle: 'italic',
                color: word.color,
                animation: `floatWord${index} ${35 + index * 4}s infinite ease-in-out`,
                opacity: 0,
                letterSpacing: '0.15em',
                textShadow: `0 0 15px ${word.color}`,
                whiteSpace: 'nowrap'
              }}
            >
              {word.text}
            </div>
          ))}
        </div>
        
        <style jsx>{`
          @keyframes floatWord0 {
            0% { opacity: 0; transform: translate(-50vw, 85vh) rotate(-15deg); }
            5% { opacity: 0.8; }
            50% { transform: translate(120vw, 15vh) rotate(10deg); }
            95% { opacity: 0.8; }
            100% { opacity: 0; transform: translate(-50vw, 85vh) rotate(-15deg); }
          }
          @keyframes floatWord1 {
            0% { opacity: 0; transform: translate(110vw, 70vh) rotate(12deg); }
            4% { opacity: 0.7; }
            50% { transform: translate(-40vw, 20vh) rotate(-8deg); }
            96% { opacity: 0.7; }
            100% { opacity: 0; transform: translate(110vw, 70vh) rotate(12deg); }
          }
          @keyframes floatWord2 {
            0% { opacity: 0; transform: translate(60vw, -30vh) rotate(-20deg); }
            6% { opacity: 0.9; }
            50% { transform: translate(30vw, 110vh) rotate(15deg); }
            94% { opacity: 0.9; }
            100% { opacity: 0; transform: translate(60vw, -30vh) rotate(-20deg); }
          }
          @keyframes floatWord3 {
            0% { opacity: 0; transform: translate(-70vw, 40vh) rotate(18deg); }
            7% { opacity: 0.6; }
            50% { transform: translate(130vw, 60vh) rotate(-12deg); }
            93% { opacity: 0.6; }
            100% { opacity: 0; transform: translate(-70vw, 40vh) rotate(18deg); }
          }
          @keyframes floatWord4 {
            0% { opacity: 0; transform: translate(90vw, 105vh) rotate(-25deg); }
            5% { opacity: 0.8; }
            50% { transform: translate(10vw, -20vh) rotate(20deg); }
            95% { opacity: 0.8; }
            100% { opacity: 0; transform: translate(90vw, 105vh) rotate(-25deg); }
          }
          @keyframes floatWord5 {
            0% { opacity: 0; transform: translate(120vw, 30vh) rotate(22deg); }
            6% { opacity: 0.75; }
            50% { transform: translate(-60vw, 50vh) rotate(-18deg); }
            94% { opacity: 0.75; }
            100% { opacity: 0; transform: translate(120vw, 30vh) rotate(22deg); }
          }
          @keyframes floatWord6 {
            0% { opacity: 0; transform: translate(20vw, -40vh) rotate(-10deg); }
            8% { opacity: 0.85; }
            50% { transform: translate(80vw, 120vh) rotate(14deg); }
            92% { opacity: 0.85; }
            100% { opacity: 0; transform: translate(20vw, -40vh) rotate(-10deg); }
          }
          @keyframes floatWord7 {
            0% { opacity: 0; transform: translate(-80vw, 10vh) rotate(16deg); }
            4% { opacity: 0.65; }
            50% { transform: translate(110vw, 90vh) rotate(-20deg); }
            96% { opacity: 0.65; }
            100% { opacity: 0; transform: translate(-80vw, 10vh) rotate(16deg); }
          }
          @keyframes floatWord8 {
            0% { opacity: 0; transform: translate(45vw, 115vh) rotate(-30deg); }
            7% { opacity: 0.7; }
            50% { transform: translate(65vw, -25vh) rotate(25deg); }
            93% { opacity: 0.7; }
            100% { opacity: 0; transform: translate(45vw, 115vh) rotate(-30deg); }
          }
          @keyframes floatWord9 {
            0% { opacity: 0; transform: translate(105vw, 55vh) rotate(28deg); }
            6% { opacity: 0.8; }
            50% { transform: translate(-45vw, 75vh) rotate(-22deg); }
            94% { opacity: 0.8; }
            100% { opacity: 0; transform: translate(105vw, 55vh) rotate(28deg); }
          }
        `}</style>
        
        <div className="w-full max-w-md" style={{ position: 'relative', zIndex: 10 }}>
          <JoinRoomComponent onBack={handleBackToMenu} />
        </div>
      </main>
    );
  }

  if (activeComponent === "create") {
    return (
      <main style={pageStyle} className="flex justify-center items-center p-4">
        {/* Background decorative elements */}
        <div style={{
          position: 'absolute',
          top: '10%',
          left: '5%',
          width: '100px',
          height: '100px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(227, 181, 16, 0.05) 0%, transparent 70%)',
          filter: 'blur(20px)'
        }} />
        <div style={{
          position: 'absolute',
          bottom: '15%',
          right: '10%',
          width: '150px',
          height: '150px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(227, 181, 16, 0.03) 0%, transparent 70%)',
          filter: 'blur(30px)'
        }} />
        
        {/* Floating virtue and vice names in background */}
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          overflow: 'hidden',
          pointerEvents: 'none',
          zIndex: 0
        }}>
          {floatingWords.map((word, index) => (
            <div
              key={word.text}
              style={{
                position: 'absolute',
                fontFamily: 'Georgia, serif',
                fontSize: '1.1rem',
                fontStyle: 'italic',
                color: word.color,
                animation: `floatWord${index} ${35 + index * 4}s infinite ease-in-out`,
                opacity: 0,
                letterSpacing: '0.15em',
                textShadow: `0 0 15px ${word.color}`,
                whiteSpace: 'nowrap'
              }}
            >
              {word.text}
            </div>
          ))}
        </div>
        
        <style jsx>{`
          @keyframes floatWord0 {
            0% { opacity: 0; transform: translate(-50vw, 85vh) rotate(-15deg); }
            5% { opacity: 0.8; }
            50% { transform: translate(120vw, 15vh) rotate(10deg); }
            95% { opacity: 0.8; }
            100% { opacity: 0; transform: translate(-50vw, 85vh) rotate(-15deg); }
          }
          @keyframes floatWord1 {
            0% { opacity: 0; transform: translate(110vw, 70vh) rotate(12deg); }
            4% { opacity: 0.7; }
            50% { transform: translate(-40vw, 20vh) rotate(-8deg); }
            96% { opacity: 0.7; }
            100% { opacity: 0; transform: translate(110vw, 70vh) rotate(12deg); }
          }
          @keyframes floatWord2 {
            0% { opacity: 0; transform: translate(60vw, -30vh) rotate(-20deg); }
            6% { opacity: 0.9; }
            50% { transform: translate(30vw, 110vh) rotate(15deg); }
            94% { opacity: 0.9; }
            100% { opacity: 0; transform: translate(60vw, -30vh) rotate(-20deg); }
          }
          @keyframes floatWord3 {
            0% { opacity: 0; transform: translate(-70vw, 40vh) rotate(18deg); }
            7% { opacity: 0.6; }
            50% { transform: translate(130vw, 60vh) rotate(-12deg); }
            93% { opacity: 0.6; }
            100% { opacity: 0; transform: translate(-70vw, 40vh) rotate(18deg); }
          }
          @keyframes floatWord4 {
            0% { opacity: 0; transform: translate(90vw, 105vh) rotate(-25deg); }
            5% { opacity: 0.8; }
            50% { transform: translate(10vw, -20vh) rotate(20deg); }
            95% { opacity: 0.8; }
            100% { opacity: 0; transform: translate(90vw, 105vh) rotate(-25deg); }
          }
          @keyframes floatWord5 {
            0% { opacity: 0; transform: translate(120vw, 30vh) rotate(22deg); }
            6% { opacity: 0.75; }
            50% { transform: translate(-60vw, 50vh) rotate(-18deg); }
            94% { opacity: 0.75; }
            100% { opacity: 0; transform: translate(120vw, 30vh) rotate(22deg); }
          }
          @keyframes floatWord6 {
            0% { opacity: 0; transform: translate(20vw, -40vh) rotate(-10deg); }
            8% { opacity: 0.85; }
            50% { transform: translate(80vw, 120vh) rotate(14deg); }
            92% { opacity: 0.85; }
            100% { opacity: 0; transform: translate(20vw, -40vh) rotate(-10deg); }
          }
          @keyframes floatWord7 {
            0% { opacity: 0; transform: translate(-80vw, 10vh) rotate(16deg); }
            4% { opacity: 0.65; }
            50% { transform: translate(110vw, 90vh) rotate(-20deg); }
            96% { opacity: 0.65; }
            100% { opacity: 0; transform: translate(-80vw, 10vh) rotate(16deg); }
          }
          @keyframes floatWord8 {
            0% { opacity: 0; transform: translate(45vw, 115vh) rotate(-30deg); }
            7% { opacity: 0.7; }
            50% { transform: translate(65vw, -25vh) rotate(25deg); }
            93% { opacity: 0.7; }
            100% { opacity: 0; transform: translate(45vw, 115vh) rotate(-30deg); }
          }
          @keyframes floatWord9 {
            0% { opacity: 0; transform: translate(105vw, 55vh) rotate(28deg); }
            6% { opacity: 0.8; }
            50% { transform: translate(-45vw, 75vh) rotate(-22deg); }
            94% { opacity: 0.8; }
            100% { opacity: 0; transform: translate(105vw, 55vh) rotate(28deg); }
          }
        `}</style>
        
        <div className="w-full max-w-md" style={{ position: 'relative', zIndex: 10 }}>
          <CreateRoomComponent onBack={handleBackToMenu} />
        </div>
      </main>
    );
  }

  return (
    <main style={pageStyle} className="flex justify-center items-center p-4">
      {/* Background decorative elements */}
      <div style={{
        position: 'absolute',
        top: '10%',
        left: '5%',
        width: '100px',
        height: '100px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(227, 181, 16, 0.05) 0%, transparent 70%)',
        filter: 'blur(20px)'
      }} />
      <div style={{
        position: 'absolute',
        bottom: '15%',
        right: '10%',
        width: '150px',
        height: '150px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(227, 181, 16, 0.03) 0%, transparent 70%)',
        filter: 'blur(30px)'
      }} />
      
      {/* Floating virtue and vice names in background */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 0
      }}>
        {floatingWords.map((word, index) => (
          <div
            key={word.text}
            style={{
              position: 'absolute',
              fontFamily: 'Georgia, serif',
              fontSize: '1.1rem',
              fontStyle: 'italic',
              color: word.color,
              animation: `floatWord${index} ${25 + index * 3}s infinite ease-in-out`,
              opacity: 0,
              letterSpacing: '0.15em',
              textShadow: `0 0 15px ${word.color}`,
              whiteSpace: 'nowrap'
            }}
          >
            {word.text}
          </div>
        ))}
      </div>
      
      <div style={{ ...paperStyle, position: 'relative', zIndex: 10 }}>
        {/* Ink stains on paper */}
        <div style={{ ...inkStainStyle, top: '10px', right: '20px', transform: 'rotate(15deg)' }} />
        <div style={{ ...inkStainStyle, bottom: '15px', left: '25px', width: '40px', height: '30px', transform: 'rotate(-20deg)' }} />
        
        {/* Worn edge effect */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          borderRadius: '4px',
          pointerEvents: 'none',
          background: `
            radial-gradient(ellipse at top left, transparent 70%, rgba(139, 100, 59, 0.05) 100%),
            radial-gradient(ellipse at bottom right, transparent 70%, rgba(139, 100, 59, 0.05) 100%)
          `
        }} />
        
        <h1 style={titleStyle}>Vice & Virtue</h1>
        <p style={subtitleStyle}>A game of deception and deduction</p>
        
        <div className="space-y-4" style={{ position: 'relative', zIndex: 20 }}>
          <button
            style={buttonStyle}
            onMouseEnter={(e) => {
              Object.assign(e.currentTarget.style, buttonHoverStyle);
            }}
            onMouseLeave={(e) => {
              Object.assign(e.currentTarget.style, buttonStyle);
            }}
            onClick={() => setActiveComponent("join")}
          >
            Join Room
          </button>
          <button
            style={buttonStyle}
            onMouseEnter={(e) => {
              Object.assign(e.currentTarget.style, buttonHoverStyle);
            }}
            onMouseLeave={(e) => {
              Object.assign(e.currentTarget.style, buttonStyle);
            }}
            onClick={() => setActiveComponent("create")}
          >
            Create Room
          </button>
        </div>
        
        <style jsx>{`
          @keyframes floatWord0 {
            0% { opacity: 0; transform: translate(-50vw, 85vh) rotate(-15deg); }
            5% { opacity: 0.8; }
            50% { transform: translate(120vw, 15vh) rotate(10deg); }
            95% { opacity: 0.8; }
            100% { opacity: 0; transform: translate(-50vw, 85vh) rotate(-15deg); }
          }
          @keyframes floatWord1 {
            0% { opacity: 0; transform: translate(110vw, 70vh) rotate(12deg); }
            4% { opacity: 0.7; }
            50% { transform: translate(-40vw, 20vh) rotate(-8deg); }
            96% { opacity: 0.7; }
            100% { opacity: 0; transform: translate(110vw, 70vh) rotate(12deg); }
          }
          @keyframes floatWord2 {
            0% { opacity: 0; transform: translate(60vw, -30vh) rotate(-20deg); }
            6% { opacity: 0.9; }
            50% { transform: translate(30vw, 110vh) rotate(15deg); }
            94% { opacity: 0.9; }
            100% { opacity: 0; transform: translate(60vw, -30vh) rotate(-20deg); }
          }
          @keyframes floatWord3 {
            0% { opacity: 0; transform: translate(-70vw, 40vh) rotate(18deg); }
            7% { opacity: 0.6; }
            50% { transform: translate(130vw, 60vh) rotate(-12deg); }
            93% { opacity: 0.6; }
            100% { opacity: 0; transform: translate(-70vw, 40vh) rotate(18deg); }
          }
          @keyframes floatWord4 {
            0% { opacity: 0; transform: translate(90vw, 105vh) rotate(-25deg); }
            5% { opacity: 0.8; }
            50% { transform: translate(10vw, -20vh) rotate(20deg); }
            95% { opacity: 0.8; }
            100% { opacity: 0; transform: translate(90vw, 105vh) rotate(-25deg); }
          }
          @keyframes floatWord5 {
            0% { opacity: 0; transform: translate(120vw, 30vh) rotate(22deg); }
            6% { opacity: 0.75; }
            50% { transform: translate(-60vw, 50vh) rotate(-18deg); }
            94% { opacity: 0.75; }
            100% { opacity: 0; transform: translate(120vw, 30vh) rotate(22deg); }
          }
          @keyframes floatWord6 {
            0% { opacity: 0; transform: translate(20vw, -40vh) rotate(-10deg); }
            8% { opacity: 0.85; }
            50% { transform: translate(80vw, 120vh) rotate(14deg); }
            92% { opacity: 0.85; }
            100% { opacity: 0; transform: translate(20vw, -40vh) rotate(-10deg); }
          }
          @keyframes floatWord7 {
            0% { opacity: 0; transform: translate(-80vw, 10vh) rotate(16deg); }
            4% { opacity: 0.65; }
            50% { transform: translate(110vw, 90vh) rotate(-20deg); }
            96% { opacity: 0.65; }
            100% { opacity: 0; transform: translate(-80vw, 10vh) rotate(16deg); }
          }
          @keyframes floatWord8 {
            0% { opacity: 0; transform: translate(45vw, 115vh) rotate(-30deg); }
            7% { opacity: 0.7; }
            50% { transform: translate(65vw, -25vh) rotate(25deg); }
            93% { opacity: 0.7; }
            100% { opacity: 0; transform: translate(45vw, 115vh) rotate(-30deg); }
          }
          @keyframes floatWord9 {
            0% { opacity: 0; transform: translate(105vw, 55vh) rotate(28deg); }
            6% { opacity: 0.8; }
            50% { transform: translate(-45vw, 75vh) rotate(-22deg); }
            94% { opacity: 0.8; }
            100% { opacity: 0; transform: translate(105vw, 55vh) rotate(28deg); }
          }
        `}</style>
      </div>
    </main>
  );
}