import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomeScreen from "./screens/HomeScreen";
import SetupScreen from "./screens/SetupScreen"; // <-- NEW IMPORT
import GameScreen from "./screens/GameScreen";
import { GameProvider } from "./context/GameContext";

// Helper component to conditionally wrap GameScreen in GameProvider
const GameScreenWrapper = () => (
    <GameProvider>
        <GameScreen />
    </GameProvider>
);

function App() {
  return (
    <Router>
      <Routes>
        {/* 1. Landing Page */}
        <Route path="/" element={<HomeScreen />} />

        {/* 2. Player Name Input / Setup */}
        <Route path="/setup" element={<SetupScreen />} /> 

        {/* 3. Main Game Board (Wrapped in GameProvider) */}
        <Route path="/game" element={<GameScreenWrapper />} />
      </Routes>
    </Router>
  );
}

export default App;