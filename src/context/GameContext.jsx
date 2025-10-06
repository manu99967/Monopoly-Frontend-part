import React, { createContext, useContext, useState, useEffect } from "react";

// -----------------------------
// EXPORTED CONSTANTS (ACTIONS)
// -----------------------------
export const ACTIONS = {
    ROLL: "ROLL", // Player needs to roll
    BUY: "BUY", // Player has landed on an unowned property and can buy it
    PAY_RENT: "PAY_RENT", // Player has landed on an owned property and must pay
    GO_TO_JAIL: "GO_TO_JAIL",
    TAX: "TAX",
    CHANCE: "CHANCE",
    COMMUNITY_CHEST: "COMMUNITY_CHEST",
    NONE: "NONE", // Turn is active, but no immediate action is needed (e.g., waiting to end turn)
    OWNED: "OWNED", // For owned properties (passive action)
};

const GameContext = createContext();

export function GameProvider({ children }) {
    const [players, setPlayers] = useState([]);
    const [currentPlayer, setCurrentPlayer] = useState(null); // Changed to null/player object ID
    const [dice, setDice] = useState([1, 1]);
    const [rolling, setRolling] = useState(false);
    const [log, setLog] = useState([]);
    const [activeTile, setActiveTile] = useState(null);
    const [activeCard, setActiveCard] = useState(null);
    const [isGameOver, setIsGameOver] = useState(false);
    
    // 🔑 NEW STATE: User Authentication
    const [user, setUser] = useState(null);
    const [isCheckingSession, setIsCheckingSession] = useState(true);

    // CRITICAL: Controls the current phase of the game
    const [actionRequired, setActionRequired] = useState(ACTIONS.ROLL); 

    const API = "http://127.0.0.1:5555";

    const addLog = (msg) => setLog((l) => [...l, msg]);

    // -----------------------------
    // HELPER FUNCTIONS
    // -----------------------------

    // Helper: Finds the player object corresponding to the current turn ID
    const getCurrentPlayer = () => {
        return players.find(p => p.id === currentPlayer);
    };

    // Helper: To simplify updating a player in state (unused if fetching full state, but good to have)
    const updatePlayerState = (newPlayerData) => {
        setPlayers((prev) => {
            const updated = [...prev];
            const index = updated.findIndex((p) => p.id === newPlayerData.id);
            if (index >= 0) updated[index] = newPlayerData;
            return updated;
        });
    };

    const fetchGameState = async () => {
        try {
            const [playersRes, stateRes] = await Promise.all([
                fetch(`${API}/players`),
                fetch(`${API}/game-state`),
            ]);
            const playersData = await playersRes.json();
            const stateData = await stateRes.json();

            setPlayers(playersData);
            // Assuming current_player from backend is the Player ID (or index, depending on your backend)
            setCurrentPlayer(stateData.current_player_id || playersData[0]?.id || null);
            setDice(stateData.last_roll || [1, 1]); // Get last roll
            setActionRequired(stateData.action_required || ACTIONS.ROLL);
            setIsGameOver(stateData.game_over || false);
            addLog("🎮 Game state refreshed.");
            
        } catch (err) {
            console.error("Error fetching initial game state:", err);
            addLog("⚠️ Failed to fetch initial game state");
        }
    };

    // -----------------------------
    // AUTHENTICATION FUNCTIONS (unchanged, but included for completeness)
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
    // CORE GAME ACTIONS
    // -----------------------------

    const endTurn = async (eliminatedPlayerId = null) => { 
        if (isGameOver) {
            addLog("Game Over. Cannot advance turn.");
            return;
        }

        setActiveTile(null);
        setActiveCard(null);
        setActionRequired(ACTIONS.ROLL); // Set for the next player

        try {
            const res = await fetch(`${API}/next_turn`, { 
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ eliminated_player_id: eliminatedPlayerId }),
            });
            const data = await res.json();

            if (data.error) {
                addLog(`Error ending turn: ${data.error}`);
            } else {
                // Backend provides the new player ID
                setCurrentPlayer(data.current_player_id); 
                addLog(`🔄 Turn switched.`);
            }
            
            // CRITICAL: Always refresh state after a turn switch
            await fetchGameState(); 

        } catch (err) {
            console.error("Error ending turn:", err);
            addLog("Error ending turn");
        }
    };
    
    const rollDice = async () => {
        if (actionRequired !== ACTIONS.ROLL || rolling || isGameOver) return;

        setRolling(true);
        addLog("🎲 Rolling dice...");

        try {
            const res = await fetch(`${API}/roll-dice`, { method: "POST" });
            const data = await res.json();

            if (data.error) {
                addLog(`Error rolling: ${data.error}`);
                setRolling(false);
                return;
            }

            // Update dice visuals before moving
            setDice(data.dice); 
            
            // Simulate dice rolling animation delay
            await new Promise(resolve => setTimeout(resolve, 1500)); 

            // After move/action is determined by backend, refresh state
            await fetchGameState(); 
            
            // Backend should have set the next action required (BUY, PAY_RENT, NONE, etc.)
            addLog(`Moved to position ${data.new_position}. Action: ${data.action_required}`);
            
            // Set any necessary helper states (e.g., the tile/card landed on)
            setActiveTile(data.active_tile || null);
            setActiveCard(data.active_card || null);
            setActionRequired(data.action_required); // Set to what the backend decides
            
        } catch (err) {
            console.error("Network error during dice roll:", err);
            addLog("Network error during dice roll.");
        } finally {
            setRolling(false);
        }
    };
    
    const buyProperty = async (propertyId) => {
        try {
            const res = await fetch(`${API}/buy-property`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ property_id: propertyId }),
            });
            const data = await res.json();

            if (res.ok) {
                addLog(`💰 ${data.player_name} bought ${data.property_name} for $${data.cost}.`);
                setActionRequired(ACTIONS.NONE); // Allow player to manage turn (end turn, etc.)
                await fetchGameState();
            } else {
                addLog(`Purchase Failed: ${data.error}`);
            }
        } catch (err) {
            addLog("Error buying property.");
        }
    };

    const skipBuyAndEndTurn = async () => {
        addLog("Player skipped buying property and is ending turn.");
        // We rely on the backend to handle the auction/next turn logic
        await endTurn();
    };

    const payRent = async () => {
        try {
            const res = await fetch(`${API}/pay-rent`, { method: 'POST' });
            const data = await res.json();

            if (res.ok) {
                addLog(`💸 Paid $${data.amount} rent to ${data.owner_name}.`);
                
                // IMPORTANT: Rent is a mandatory action that usually ends the turn.
                // We assume the backend handles the money transfer and advances the turn.
                if (data.eliminated_player_id) {
                     addLog(`😭 ${data.payer_name} has been eliminated!`);
                     // Pass the eliminated ID to the general endTurn flow for log/state update
                     await endTurn(data.eliminated_player_id); 
                } else {
                    // Refresh state and let endTurn handle the turn switch if backend didn't
                    await fetchGameState(); 
                }
            } else {
                addLog(`Rent Failed: ${data.error}`);
            }
        } catch (err) {
            addLog("Error paying rent.");
        }
    };
    
    const payTax = async () => {
        try {
            const res = await fetch(`${API}/pay-tax`, { method: 'POST' });
            const data = await res.json();

            if (res.ok) {
                addLog(`💵 Paid $${data.amount} in taxes.`);
                setActionRequired(ACTIONS.NONE); // Allow turn continuation
                await fetchGameState();
            } else {
                addLog(`Tax Failed: ${data.error}`);
            }
        } catch (err) {
            addLog("Error paying tax.");
        }
    };
    
    const goToJail = async () => {
        // This function is often called internally by rollDice, 
        // but if it's external, it updates the player state to 'in jail'.
        try {
            const res = await fetch(`${API}/go-to-jail`, { method: 'POST' });
            const data = await res.json();

            if (res.ok) {
                addLog(`🚨 Go directly to Jail. Do not pass Go. Do not collect $200.`);
                // Going to jail automatically ends the turn.
                await endTurn(); 
            } else {
                addLog(`Jail failed: ${data.error}`);
            }
        } catch (err) {
            addLog("Error sending player to jail.");
        }
    };
    
    const drawCard = async (deck) => {
        try {
            const res = await fetch(`${API}/draw-card/${deck}`, { method: 'POST' });
            const data = await res.json();

            if (res.ok) {
                setActiveCard(data.card);
                addLog(`🃏 Drew a ${deck} Card: ${data.card.text}`);
                
                // Backend should determine the next action (pay, move, end turn, etc.)
                setActionRequired(data.action_required); 
                await fetchGameState();
            } else {
                addLog(`Card draw failed: ${data.error}`);
            }
        } catch (err) {
            addLog("Error drawing card.");
        }
    };


    // -----------------------------
    // INITIAL MOUNT EFFECT
    // -----------------------------
    useEffect(() => {
        checkSession();
        // NOTE: fetchGameState will run regardless of session. 
        // You might want to delay it until AFTER login if the game isn't persistent.
        fetchGameState(); 
    }, []); 

    // -----------------------------
    // PROVIDER EXPORT
    // -----------------------------
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
                getCurrentPlayer,
                
                // AUTH VALUES
                user,
                loginUser,
                signupUser,
                logoutUser,
                isCheckingSession,
            }}
        >
            {children}
        </GameContext.Provider>
    );
}

export const useGame = () => useContext(GameContext);