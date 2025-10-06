import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import HomeScreen from "./screens/HomeScreen";
import SetupScreen from "./screens/SetupScreen"; 
import GameScreen from "./screens/GameScreen";
// 🔑 NEW IMPORTS
import LoginScreen from "./screens/LoginScreen"; 
import SignupScreen from "./screens/SignupScreen";
// 🔑 IMPORT CONTEXT
import { GameProvider, useGame } from "./context/GameContext"; 


// 🔑 NEW: A wrapper to protect routes requiring authentication
const ProtectedRoute = ({ children }) => {
    const { user, isCheckingSession } = useGame();
    
    if (isCheckingSession) {
        // You would typically show a loading spinner here
        return <div>Loading session...</div>;
    }

    if (!user) {
        // Redirect to the login page if not logged in
        return <Navigate to="/login" replace />;
    }

    return children;
};

function App() {
  return (
    <Router>
      {/* 🔑 Move GameProvider up to wrap ALL routes that need user context */}
      <GameProvider> 
        <Routes>
          {/* 1. Public Auth Routes */}
          <Route path="/" element={<HomeScreen />} />
          <Route path="/login" element={<LoginScreen />} /> 
          <Route path="/signup" element={<SignupScreen />} />

          {/* 2. Protected Game Setup Routes */}
          <Route 
              path="/setup" 
              element={
                  <ProtectedRoute>
                      <SetupScreen /> 
                  </ProtectedRoute>
              } 
          /> 

          {/* 3. Protected Main Game Board Route */}
          <Route 
              path="/game" 
              element={
                  <ProtectedRoute>
                      <GameScreen />
                  </ProtectedRoute>
              } 
          />
        </Routes>
      </GameProvider>
    </Router>
  );
}

export default App;