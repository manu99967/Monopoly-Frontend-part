import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomeScreen from "./screens/HomeScreen";
import GameScreen from "./screens/GameScreen";
import { GameProvider } from "./context/GameContext";

function App() {
  return (
    <GameProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomeScreen />} />
          <Route path="/game" element={<GameScreen />} />
        </Routes>
      </Router>
    </GameProvider>
  );
}

export default App;
