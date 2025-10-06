import React, { useState, useEffect } from "react";

export default function Dice({ dice, rolling, onRoll, disabled }) {
  const [animatedDice, setAnimatedDice] = useState(dice);

  useEffect(() => {
    if (!rolling) {
      // Stop animation and show actual dice
      setAnimatedDice(dice);
      return;
    }

    // 🎞️ Animate random dice every 100ms
    const interval = setInterval(() => {
      setAnimatedDice([
        Math.ceil(Math.random() * 6),
        Math.ceil(Math.random() * 6),
      ]);
    }, 100);

    // Stop animation after half a second
    const timeout = setTimeout(() => clearInterval(interval), 500);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [rolling, dice]);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="text-3xl font-bold flex gap-2">
        🎲 {animatedDice[0]} & 🎲 {animatedDice[1]}
      </div>

      <button
        onClick={onRoll}
        disabled={rolling || disabled} // ✅ Now respects the disabled prop
        className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {rolling ? "Rolling..." : "Roll Dice"}
      </button>
    </div>
  );
}

