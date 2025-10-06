import React, { createContext, useContext, useState, useEffect } from "react";

// -----------------------------
// EXPORTED CONSTANTS (ACTIONS)
// -----------------------------
export const ACTIONS = {
    ROLL: "ROLL",
    BUY: "BUY",
    PAY_RENT: "PAY_RENT",
    GO_TO_JAIL: "GO_TO_JAIL",
    TAX: "TAX",
    CHANCE: "CHANCE",
    COMMUNITY_CHEST: "COMMUNITY_CHEST",
    NONE: "NONE", 
    OWNED: "OWNED", // For owned properties (passive action)
};

const GameContext = createContext();

export function GameProvider({ children }) {
    const [players, setPlayers] = useState([]);
    const [currentPlayer, setCurrentPlayer] = useState(0);
    const [dice, setDice] = useState([1, 1]);
    const [rolling, setRolling] = useState(false);
    const [log, setLog] = useState([]);
    const [activeTile, setActiveTile] = useState(null);
    const [activeCard, setActiveCard] = useState(null);
    const [isGameOver, setIsGameOver] = useState(false); 
    
    // 🔑 NEW STATE: User Authentication
    const [user, setUser] = useState(null);
    const [isCheckingSession, setIsCheckingSession] = useState(true); // To prevent flashing screens

    // CRITICAL: Controls the current phase of the game
    const [actionRequired, setActionRequired] = useState(ACTIONS.ROLL); 

    const API = "http://127.0.0.1:5555";

    const addLog = (msg) => setLog((l) => [...l, msg]);

    // HELPER FUNCTION: To simplify updating a player in state
    const updatePlayerState = (newPlayerData) => {
        setPlayers((prev) => {
            const updated = [...prev];
            const index = updated.findIndex((p) => p.id === newPlayerData.id);
            if (index >= 0) updated[index] = newPlayerData;
            return updated;
        });
    };

    // -----------------------------
    // 🔑 AUTHENTICATION FUNCTIONS
    // -----------------------------

    const checkSession = async () => {
        setIsCheckingSession(true);
        try {
            const res = await fetch(`${API}/check-session`);
            if (res.ok) {
                const userData = await res.json();
                setUser(userData);
                addLog(`✅ Session restored for ${userData.username}`);
            }
        } catch (err) {
            console.error("Session check failed:", err);
        } finally {
            setIsCheckingSession(false);
        }
    };
    
    const loginUser = async (username, password) => {
        try {
            const res = await fetch(`${API}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });
            const data = await res.json();

            if (res.ok) {
                setUser(data);
                addLog(`👋 Welcome back, ${data.username}!`);
                return true;
            } else {
                addLog(`Login Failed: ${data.error}`);
                return false;
            }
        } catch (err) {
            addLog("Network error during login.");
            return false;
        }
    };

    const signupUser = async (username, password) => {
        try {
            const res = await fetch(`${API}/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });
            const data = await res.json();

            if (res.ok) {
                setUser(data);
                addLog(`🎉 Account created! Welcome, ${data.username}!`);
                return true;
            } else {
                addLog(`Signup Failed: ${data.error}`);
                return false;
            }
        } catch (err) {
            addLog("Network error during signup.");
            return false;
        }
    };

    const logoutUser = async () => {
        try {
            await fetch(`${API}/logout`, { method: 'POST' });
            setUser(null);
            addLog("🚪 Successfully logged out.");
            return true;
        } catch (err) {
            addLog("Error logging out.");
            return false;
        }
    };


    // -----------------------------
    // INITIAL FETCH & SESSION CHECK
    // -----------------------------
    const fetchGameState = async () => {
        // ... (fetchGameState logic remains the same) ...
        try {
            const [playersRes, stateRes] = await Promise.all([
                fetch(`${API}/players`),
                fetch(`${API}/game-state`),
            ]);
            const playersData = await playersRes.json();
            const stateData = await stateRes.json();

            if (playersData.length <= 1) {
                setIsGameOver(true);
                addLog("🏁 Game Over: Only one or zero players remaining.");
            }
            
            setPlayers(playersData);
            setCurrentPlayer(stateData.current_player || 0);
            setActionRequired(ACTIONS.ROLL);
            addLog("🎮 Game initialized");
        } catch (err) {
            console.error("Error fetching initial game state:", err);
            addLog("⚠️ Failed to fetch initial game state");
        }
    };

    useEffect(() => {
        checkSession();
        fetchGameState();
    }, []); // Run only on initial mount


    // -----------------------------
    // END TURN / NEXT TURN (unchanged)
    // -----------------------------
    const endTurn = async (eliminatedPlayerId = null) => { 
        // ... (endTurn logic remains the same) ...
        if (isGameOver) {
            addLog("Game Over. Cannot advance turn.");
            return;
        }

        setActiveTile(null);
        setActiveCard(null);

        try {
            const res = await fetch(`${API}/next_turn`, { 
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ eliminated_player_id: eliminatedPlayerId }),
            });
            const data = await res.json();

            if (data.error) {
                 addLog(data.error);
                 if (data.error.includes("Game Over")) {
                     setIsGameOver(true);
                 }
            } else {
                setCurrentPlayer(data.current_player);
                addLog(`🔄 Next turn: Player ${data.current_player + 1}`);
            }

            const playersRes = await fetch(`${API}/players`);
            const playersData = await playersRes.json();
            setPlayers(playersData);

            if (playersData.length === 1 && !isGameOver) {
                setIsGameOver(true);
                addLog(`🏆 ${playersData[0].name} wins!`);
            }

        } catch (err) {
            console.error(err);
            addLog("Error ending turn");
        }
        
        if (!isGameOver) {
            setActionRequired(ACTIONS.ROLL); 
        }
    };
    
    // ... (payRent, payTax, goToJail, rollDice, buyProperty, skipBuyAndEndTurn, drawCard functions remain the same) ...

    const payRent = async (playerId, propertyPosition) => { /* ... existing code ... */ };
    const payTax = async (playerId, taxPosition) => { /* ... existing code ... */ };
    const goToJail = async (playerId) => { /* ... existing code ... */ };
    const rollDice = async () => { /* ... existing code ... */ };
    const buyProperty = async (tile) => { /* ... existing code ... */ };
    const skipBuyAndEndTurn = async () => { /* ... existing code ... */ };
    const drawCard = async () => { /* ... existing code ... */ };


    return (
        <GameContext.Provider
            value={{
                players,
                currentPlayer,
                dice,
                rolling,
                rollDice,
                log,
                activeTile,
                setActiveTile,
                buyProperty,
                skipBuyAndEndTurn, 
                activeCard,
                setActiveCard,
                addLog,
                endTurn,
                payRent, 
                payTax, 
                goToJail, 
                drawCard,
                actionRequired, 
                isGameOver, 
                // 🔑 EXPORT NEW AUTH VALUES
                user,
                loginUser,
                signupUser,
                logoutUser,
                isCheckingSession, // Export to show loading spinner on initial load
            }}
        >
            {children}
        </GameContext.Provider>
    );
}

export const useGame = () => useContext(GameContext);