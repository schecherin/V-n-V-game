import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";

// Mock next/navigation hooks used by the page
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
  useSearchParams: () => ({ get: jest.fn(() => null) }),
}));

// Mock child components to avoid deep rendering complexity
jest.mock("@/components/lobby/JoinRoomComponent", () => ({
  __esModule: true,
  default: ({ onBack }: { onBack: () => void }) => (
    <div>
      <span>Join Room Component</span>
      <button onClick={onBack}>Back</button>
    </div>
  ),
}));

jest.mock("@/components/lobby/CreateRoomComponent", () => ({
  __esModule: true,
  default: ({ onBack }: { onBack: () => void }) => (
    <div>
      <span>Create Room Component</span>
      <button onClick={onBack}>Back</button>
    </div>
  ),
}));

// Import after mocks
import MainMenu from "@/app/page";

describe("MainMenu page", () => {
  test("renders landing menu with title and buttons", () => {
    render(<MainMenu />);
    expect(screen.getByText(/Vice & Virtue/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Join Room/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Create Room/i })
    ).toBeInTheDocument();
  });

  test("clicking Join Room shows JoinRoomComponent and back works", () => {
    render(<MainMenu />);
    fireEvent.click(screen.getByRole("button", { name: /Join Room/i }));
    expect(screen.getByText(/Join Room Component/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Back/i }));
    expect(screen.getByText(/Vice & Virtue/i)).toBeInTheDocument();
  });

  test("clicking Create Room shows CreateRoomComponent and back works", () => {
    render(<MainMenu />);
    fireEvent.click(screen.getByRole("button", { name: /Create Room/i }));
    expect(screen.getByText(/Create Room Component/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Back/i }));
    expect(screen.getByText(/Vice & Virtue/i)).toBeInTheDocument();
  });

  test("URL param 'code' opens Join view initially", () => {
    const getMock = jest.fn(() => "ABCD");
    jest.requireMock("next/navigation").useSearchParams = () => ({
      get: getMock,
    });
    render(<MainMenu />);
    expect(getMock).toHaveBeenCalledWith("code");
    expect(screen.getByText(/Join Room Component/i)).toBeInTheDocument();
  });
});
