"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCreateGame } from "@/hooks/useCreateGame";

interface CreateRoomComponentProps {
  onBack: () => void;
}

export default function CreateRoomComponent({
  onBack,
}: CreateRoomComponentProps) {
  const router = useRouter();
  const [playerName, setPlayerName] = useState("");
  const [maxPlayers, setMaxPlayers] = useState(10);
  const { create, loading: isLoading, error } = useCreateGame();

  const handleCreateRoom = async () => {
    if (!playerName.trim()) {
      alert("Please enter your name");
      return;
    }
    await create(playerName, maxPlayers);
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
      radial-gradient(ellipse at 80% 70%, rgba(78, 54, 36, 0.03) 0%, transparent 50%)
    `,
    border: '3px solid #e3b510',
    borderRadius: '4px',
    boxShadow: `
      0 0 40px rgba(0, 0, 0, 0.5),
      inset 0 0 40px rgba(139, 100, 59, 0.1),
      0 0 100px rgba(227, 181, 16, 0.1)
    `,
    padding: '1.5rem',
    position: 'relative' as const
  };

  const titleStyle: React.CSSProperties = {
    fontFamily: 'Georgia, serif',
    fontSize: '1.8rem',
    color: '#3d2a1b',
    fontWeight: 'bold',
    marginBottom: '0.5rem',
    textShadow: '2px 2px 4px rgba(0, 0, 0, 0.2)',
    letterSpacing: '0.05em'
  };

  const subtitleStyle: React.CSSProperties = {
    fontFamily: 'Georgia, serif',
    fontSize: '0.9rem',
    color: '#6b4c35',
    fontStyle: 'italic',
    opacity: 0.8
  };

  const labelStyle: React.CSSProperties = {
    fontFamily: 'Georgia, serif',
    fontSize: '0.9rem',
    fontWeight: 'bold',
    color: '#4E3624',
    marginBottom: '0.5rem',
    display: 'block'
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.75rem',
    backgroundColor: 'rgba(255, 239, 197, 0.7)',
    border: '2px solid #e3b510',
    borderRadius: '4px',
    fontSize: '1rem',
    fontFamily: 'Georgia, serif',
    color: '#3d2a1b',
    boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.1)',
    transition: 'all 0.3s ease'
  };

  const selectStyle: React.CSSProperties = {
    ...inputStyle,
    cursor: 'pointer',
    appearance: 'none' as any,
    backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23e3b510' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 0.7rem center',
    backgroundSize: '1.5em',
    paddingRight: '2.5rem'
  };

  const buttonStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.875rem',
    backgroundColor: '#ffefc5',
    backgroundImage: `linear-gradient(180deg, rgba(255, 239, 197, 0.9), rgba(240, 220, 180, 0.9))`,
    border: '2px solid #e3b510',
    color: '#3d2a1b',
    fontSize: '1rem',
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
    textTransform: 'uppercase' as const
  };

  const primaryButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    backgroundColor: '#3d2a1b',
    backgroundImage: 'none',
    color: '#ffefc5',
    border: '2px solid #e3b510'
  };

  return (
    <div style={paperStyle} className="space-y-6">
      <div className="text-center">
        <h2 style={titleStyle}>Create Room</h2>
        <p style={subtitleStyle}>Set up your Vice & Virtue game</p>
      </div>

      <div className="space-y-4">
        <div>
          <label style={labelStyle}>Your Name</label>
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            style={inputStyle}
            placeholder="Enter your name"
            maxLength={20}
            onFocus={(e) => {
              e.currentTarget.style.backgroundColor = '#fff';
              e.currentTarget.style.borderColor = '#d4a510';
            }}
            onBlur={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 239, 197, 0.7)';
              e.currentTarget.style.borderColor = '#e3b510';
            }}
          />
        </div>

        <div>
          <label style={labelStyle}>Max Players</label>
          <select
            value={maxPlayers}
            onChange={(e) => setMaxPlayers(parseInt(e.target.value))}
            style={selectStyle}
            onFocus={(e) => {
              e.currentTarget.style.backgroundColor = '#fff';
              e.currentTarget.style.borderColor = '#d4a510';
            }}
            onBlur={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 239, 197, 0.7)';
              e.currentTarget.style.borderColor = '#e3b510';
            }}
          >
            <option value={6}>6 Players</option>
            <option value={8}>8 Players</option>
            <option value={10}>10 Players</option>
            <option value={12}>12 Players</option>
          </select>
        </div>

        {error && (
          <div style={{
            backgroundColor: 'rgba(139, 0, 0, 0.1)',
            border: '2px solid rgba(139, 0, 0, 0.3)',
            color: '#8b0000',
            padding: '0.75rem',
            borderRadius: '4px',
            fontFamily: 'Georgia, serif',
            fontSize: '0.9rem'
          }}>
            {error}
          </div>
        )}
      </div>

      <div className="space-y-3">
        <button
          onClick={handleCreateRoom}
          disabled={isLoading}
          style={{
            ...primaryButtonStyle,
            opacity: isLoading ? 0.5 : 1,
            cursor: isLoading ? 'not-allowed' : 'pointer'
          }}
          onMouseEnter={(e) => {
            if (!isLoading) {
              e.currentTarget.style.backgroundColor = '#e3b510';
              e.currentTarget.style.color = '#2a1f15';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = `
                0 6px 12px rgba(0, 0, 0, 0.4),
                inset 0 1px 0 rgba(255, 255, 255, 0.4),
                0 0 20px rgba(227, 181, 16, 0.3)
              `;
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#3d2a1b';
            e.currentTarget.style.color = '#ffefc5';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = `
              0 4px 6px rgba(0, 0, 0, 0.3),
              inset 0 1px 0 rgba(255, 255, 255, 0.3)
            `;
          }}
        >
          {isLoading ? "Creating..." : "Create Game"}
        </button>

        <button
          onClick={onBack}
          style={buttonStyle}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#e3b510';
            e.currentTarget.style.backgroundImage = 'none';
            e.currentTarget.style.color = '#2a1f15';
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = `
              0 6px 12px rgba(0, 0, 0, 0.4),
              inset 0 1px 0 rgba(255, 255, 255, 0.4),
              0 0 20px rgba(227, 181, 16, 0.3)
            `;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#ffefc5';
            e.currentTarget.style.backgroundImage = `linear-gradient(180deg, rgba(255, 239, 197, 0.9), rgba(240, 220, 180, 0.9))`;
            e.currentTarget.style.color = '#3d2a1b';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = `
              0 4px 6px rgba(0, 0, 0, 0.3),
              inset 0 1px 0 rgba(255, 255, 255, 0.3)
            `;
          }}
        >
          Back to Menu
        </button>
      </div>
    </div>
  );
}