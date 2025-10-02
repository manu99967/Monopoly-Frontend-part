import React, { useState } from "react"
import { useGame } from "../context/GameContext"

export default function TradeModal({ onClose }) {
  const { players, addLog } = useGame()
  const [from, setFrom] = useState(players[0].id)
  const [to, setTo] = useState(players[1].id)
  const [amount, setAmount] = useState(0)

  const confirmTrade = () => {
    addLog(
      `${players.find((p) => p.id === from).name} traded $${amount} to ${
        players.find((p) => p.id === to).name
      }`
    )
    onClose()
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white p-6 rounded-xl w-96 shadow-lg">
        <h2 className="text-xl font-bold mb-4">Trade</h2>
        <label className="block mb-2">From:</label>
        <select
          className="w-full border p-2 rounded mb-4"
          value={from}
          onChange={(e) => setFrom(Number(e.target.value))}
        >
          {players.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        <label className="block mb-2">To:</label>
        <select
          className="w-full border p-2 rounded mb-4"
          value={to}
          onChange={(e) => setTo(Number(e.target.value))}
        >
          {players.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        <label className="block mb-2">Amount ($):</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          className="w-full border p-2 rounded mb-4"
        />
        <div className="flex gap-2">
          <button
            onClick={confirmTrade}
            className="flex-1 bg-green-600 text-white py-2 rounded"
          >
            Confirm
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-red-600 text-white py-2 rounded"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
