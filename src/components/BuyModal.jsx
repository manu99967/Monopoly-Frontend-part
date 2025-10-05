import React from 'react';

// Assuming tile prop looks like: { position: 1, name: "Mediterrean Ave", price: 60, rent: 2, ... }
export default function BuyModal({ tile, onBuy, onSkip, currentPlayerData }) {
    
    // 🛑 CRITICAL CHECK: Ensure the tile prop exists and has the necessary data
    if (!tile || !tile.name || tile.price === undefined) return null; 

    const { 
        name, 
        price, 
        rent // We'll display rent too, just to be sure
    } = tile; 

    const canAfford = currentPlayerData?.money >= price;
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-2xl max-w-sm w-full text-center border-t-8 border-yellow-500">
                
                {/* 🎯 FIX 1: Displaying the Property Name */}
                <h2 className="text-2xl font-bold mb-4">Unowned Property: {name}</h2>
                
                <div className="mb-4 p-3 bg-gray-100 rounded">
                    {/* 🎯 FIX 2: Displaying the Price and Rent */}
                    <p className="text-lg">Purchase Price: <strong className="text-green-600">${price}</strong></p>
                    <p className="text-md">Base Rent: ${rent}</p>
                </div>

                <p className="mb-4">Your current balance: ${currentPlayerData?.money}</p>

                <div className="flex justify-center gap-4">
                    
                    <button 
                        onClick={onBuy}
                        disabled={!canAfford}
                        className={`px-4 py-2 rounded font-semibold transition duration-200 
                            ${canAfford ? 'bg-green-500 hover:bg-green-600 text-white' : 'bg-gray-400 text-gray-700 cursor-not-allowed'}`}
                    >
                        {canAfford ? `Buy for $${price}` : 'Too Expensive'}
                    </button>
                    
                    <button 
                        onClick={onSkip}
                        className="px-4 py-2 rounded font-semibold bg-red-500 hover:bg-red-600 text-white"
                    >
                        Skip
                    </button>

                </div>
            </div>
        </div>
    );
}