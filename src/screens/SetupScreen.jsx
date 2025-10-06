import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// 🔑 FIX 1: CHANGE IP ADDRESS TO LOCALHOST NAME
// All network requests must use 'localhost' to match your Flask CORS settings
// and avoid the '127.0.0.1' conflict.
// 🔑 FIX 2: ADD '/api' TO THE BASE URL
// Your Flask routes are under the '/api' blueprint, so the base URL must include it.
const API = "http://localhost:5555/api"; 

export default function SetupScreen() {
    const navigate = useNavigate();
    const [players, setPlayers] = useState([]);
    const [inputName, setInputName] = useState('');
    const [status, setStatus] = useState('');

    const handleAddPlayer = (e) => {
        e.preventDefault();
        if (inputName.trim() && players.length < 6) {
            setPlayers([...players, inputName.trim()]);
            setInputName('');
            setStatus('');
        } else if (players.length >= 6) {
            setStatus("Maximum of 6 players reached.");
        }
    };

    const handleStartGame = async () => {
        if (players.length < 2) {
            setStatus("You need at least 2 players to start.");
            return;
        }

        setStatus("Initializing game...");
        
        try {
            // 1. Reset Game State (Now correctly hits: http://localhost:5555/api/reset-game)
            await fetch(`${API}/reset-game`, { method: 'POST', credentials:'include'});

            // 2. Add all new players to the database (Now correctly hits: http://localhost:5555/api/players)
            for (const name of players) {
                const res = await fetch(`${API}/players`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name: name }),
                    credentials: 'include'
                });
                if (!res.ok) {
                    throw new Error(`Failed to add player ${name} (Status:${res.status})`);
                }
            }
            
            // 3. Navigate to the game board
            navigate('/game'); 
            
        } catch (error) {
            console.error("Game setup failed:", error);
            setStatus(`Error: ${error.message}. Please check console for network errors.`);
        }
    };

    return (
        // ... (rest of the component JSX remains unchanged) ...
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
            <h1 className="text-4xl font-bold mb-8 text-blue-800">Monopoly Player Setup</h1>

            {/* Input Form */}
            <form onSubmit={handleAddPlayer} className="w-full max-w-sm mb-6">
                <div className="flex items-center border-b border-blue-500 py-2">
                    <input
                        className="appearance-none bg-transparent border-none w-full text-gray-700 mr-3 py-1 px-2 leading-tight focus:outline-none"
                        type="text"
                        placeholder="Enter Player Name"
                        value={inputName}
                        onChange={(e) => setInputName(e.target.value)}
                        disabled={players.length >= 6}
                    />
                    <button
                        className="flex-shrink-0 bg-blue-500 hover:bg-blue-700 text-sm border-4 border-blue-500 hover:border-blue-700 text-white py-1 px-2 rounded disabled:opacity-50"
                        type="submit"
                        disabled={players.length >= 6}
                    >
                        Add Player
                    </button>
                </div>
                <p className="text-gray-500 text-xs mt-2">Added: {players.length} / 6</p>
            </form>

            {/* Player List */}
            <div className="w-full max-w-sm mb-6 p-4 border rounded bg-white shadow">
                <h3 className="text-xl font-semibold mb-2">Players Ready:</h3>
                {players.length === 0 ? (
                    <p className="text-gray-500">Add at least 2 players.</p>
                ) : (
                    <ul className="list-disc list-inside space-y-1">
                        {players.map((name, index) => (
                            <li key={index} className="text-gray-800">{index + 1}. {name}</li>
                        ))}
                    </ul>
                )}
            </div>

            {/* Start Button */}
            <button
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-full shadow-lg disabled:opacity-50 transition duration-150"
                onClick={handleStartGame}
                disabled={players.length < 2 || status.includes("Initializing")}
            >
                Start Game ({players.length} Players)
            </button>
            
            {status && (
                <p className="mt-4 text-red-500 font-medium">{status}</p>
            )}
        </div>
    );
}