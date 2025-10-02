import React from "react"

export default function WinModal({ winner }) {
  if (!winner) return null

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50">
      <div className="bg-white p-10 rounded-2xl shadow-xl text-center">
        <h1 className="text-3xl font-bold text-green-600 mb-4">🎉 Game Over 🎉</h1>
        <p className="text-lg">Winner: {winner.name}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg"
        >
          Restart
        </button>
      </div>
    </div>
  )
}
