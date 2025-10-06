import React from "react"
import { useNavigate } from "react-router-dom"

export default function HomeScreen() {
  const navigate = useNavigate()

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-200 to-green-500 text-center">
      <h1 className="text-5xl font-extrabold text-white drop-shadow-lg mb-6">
        🎲 Monopoly Game
      </h1>
      <p className="text-lg text-white/90 mb-10 max-w-lg">
        Welcome to Monopoly! Buy, sell, trade, and build your way to victory.  
        Only one player will become the richest and win it all!
      </p>
      <button
        // 🔑 FIX: Navigate to the new setup screen
        onClick={() => navigate("/setup")} 
        className="px-8 py-4 text-lg font-semibold bg-yellow-400 text-black rounded-2xl shadow-lg hover:bg-yellow-500 transition-transform hover:scale-105"
      >
        Start Game
      </button>
    </div>
  )
}