import React from "react";

export default function BuyModal({ tile, onBuy, onSkip }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white p-6 rounded-2xl shadow-xl w-80 text-center">
        <h2 className="text-xl font-bold mb-4">Buy Property?</h2>
        <p className="mb-4">{tile.name} costs ${tile.price}</p>
        <div className="flex justify-around gap-4">
          <button
            onClick={onBuy}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Buy
          </button>
          <button
            onClick={onSkip}
            className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
          >
            Skip
          </button>
        </div>
      </div>
    </div>
  );
}
