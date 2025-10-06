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
    const [currentPlayer, setCurrentPlayer] = useState(null); // The ID of the current Player in the game turn
    const [dice, setDice] = useState([1, 1]);
    const [rolling, setRolling] = useState(false);
    const [log, setLog] = useState([]);
    const [activeTile, setActiveTile] = useState(null); // Tile object the player landed on
    const [activeCard, setActiveCard] = useState(null); // Card object if drawn
    const [isGameOver, setIsGameOver] = useState(false);
    
    // 🔑 NEW STATE: User Authentication
    const [user, setUser] = useState(null); // The logged-in User object
    const [isCheckingSession, setIsCheckingSession] = useState(true);

    // CRITICAL: Controls the current phase of the game
    const [actionRequired, setActionRequired] = useState(ACTIONS.ROLL); 

    // 🔑 FINAL FIX: Change 127.0.0.1 to localhost to resolve cross-origin cookie issue
    const API = "http://localhost:5555/api"; 

    const addLog = (msg) => setLog((l) => [...l, msg]);

    // -----------------------------
    // HELPER FUNCTIONS
    // -----------------------------

    // Helper: Finds the player object corresponding to the current turn ID
    const getCurrentPlayer = () => {
        return players.find(p => p.id === currentPlayer);
    };

    // Helper: Checks if it's the current user's turn
    const isCurrentPlayerTurn = () => {
        // If user is not set, allow all actions (for local play)
        if (!user) return true;
        const player = getCurrentPlayer();
        // If player has a username, compare to logged-in user
        if (player && player.username && user.username) {
            return player.username === user.username;
        }
        // Otherwise, compare by id
        return player && player.id === currentPlayer;
    };

    // Helper: Checks if the current player can perform a given action
    const canPerformAction = (action) => {
        // Only allow if it's the current player's turn and the required action matches
        return isCurrentPlayerTurn() && actionRequired === action && !isGameOver;
    };

    const fetchGameState = async () => {
        try {
            // These calls now correctly include credentials: 'include'
            const [playersRes, stateRes] = await Promise.all([
                fetch(`${API}/players`, { credentials: 'include' }),
                fetch(`${API}/game-state`, { credentials: 'include' }),
            ]);
            
            // If authentication failed, stop and log it
            if (playersRes.status === 401 || stateRes.status === 401) {
                   addLog("⚠️ Not logged in or session expired. Cannot fetch game data.");
                   setPlayers([]);
                   setCurrentPlayer(null);
                   return;
            }

            const playersData = await playersRes.json();
            const stateData = await stateRes.json();

            setPlayers(playersData);
            setCurrentPlayer(stateData.current_player_id || playersData[0]?.id || null); 
            setDice(stateData.last_roll || [1, 1]);
            setActionRequired(stateData.action_required || ACTIONS.ROLL);
            setIsGameOver(stateData.game_over || false);
            addLog("🎮 Game state refreshed.");
            
        } catch (err) {
            console.error("Error fetching initial game state:", err);
            addLog("⚠️ Failed to fetch initial game state");
        }
    };

    // -----------------------------
    // AUTHENTICATION FUNCTIONS
    // -----------------------------

    const checkSession = async () => {
        setIsCheckingSession(true);
        try {
            const res = await fetch(`${API}/check-session`, {
                credentials: 'include',
            });
            if (res.ok) {
                const userData = await res.json();
                setUser(userData);
                addLog(`✅ Session restored for ${userData.username}`);
                await fetchGameState(); 
            } else {
                setUser(null);
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
                credentials: 'include', 
            });
            const data = await res.json();

            if (res.ok) {
                setUser(data);
                addLog(`👋 Welcome back, ${data.username}!`);
                await fetchGameState(); // Load game data immediately
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
                credentials: 'include', 
            });
            const data = await res.json();

            if (res.ok) {
                setUser(data);
                addLog(`🎉 Account created! Welcome, ${data.username}!`);
                await fetchGameState(); // Load game data immediately
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
            await fetch(`${API}/logout`, { 
                method: 'POST',
                credentials: 'include', 
            });
            setUser(null);
            setPlayers([]); 
            setCurrentPlayer(null); 
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
        setActionRequired(ACTIONS.ROLL); 

        try {
            const res = await fetch(`${API}/next_turn`, { 
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ eliminated_player_id: eliminatedPlayerId }),
                credentials: 'include',
            });
            const data = await res.json();

            if (data.error) {
                addLog(`Error ending turn: ${data.error}`);
            } else {
                setCurrentPlayer(data.current_player_id); 
                addLog(`🔄 Turn switched.`);
            }
            
            await fetchGameState(); 

        } catch (err) {
            console.error("Error ending turn:", err);
            addLog("Error ending turn");
        }
    };
    
    const rollDice = async () => {
        // Retrieve the current player object using the helper
        const player = getCurrentPlayer();

        if (actionRequired !== ACTIONS.ROLL || rolling || isGameOver || !player) {
            // If the player isn't ready or doesn't exist, exit.
            if (!player) addLog("Error: Current player identity missing.");
            return;
        }

        setRolling(true);
        addLog("🎲 Rolling dice...");

        try {
            const res = await fetch(`${API}/roll-dice`, { 
                method: "POST",
                // 🛑 FIX for 415: Add Content-Type header
                headers: { 'Content-Type': 'application/json' },
                // 🛑 FIX for 415/403: Send the player ID in the body
                body: JSON.stringify({ player_id: player.id }),
                credentials: 'include', 
            });
            const data = await res.json();

            if (res.status === 401 || res.status === 403) {
                   // Handle specific 401 (Unauthorized) or 403 (Forbidden/Not your turn) errors
                addLog(`Error rolling: ${data.error || "Authentication failed or not your turn."}`);
                setRolling(false);
                return;
            }
            
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

            // Debug: Log backend response for player positions and current player
            console.log("🎯 Updated players from backend:", data.players);
            console.log("🎯 Current player after roll:", data.current_player);

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
    
    // 🚨 NOTE: The following actions need the CURRENT PLAYER's ID and credentials: 'include'
    
    const buyProperty = async (propertyId) => {
        const player = getCurrentPlayer();
        const propertyPosition = propertyId; 
        if (!player || actionRequired !== ACTIONS.BUY || !activeTile) return addLog("Cannot buy now.");
        
        try {
            const res = await fetch(`${API}/buy-property`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    property_position: activeTile.position,
                    player_id: player.id // Send current player ID
                }),
                credentials: 'include', // Needed for authorization
            });
            const data = await res.json();

            if (res.ok) {
                addLog(`💰 ${data.player_name} bought ${data.property_name} for $${data.cost}.`);
                setActionRequired(ACTIONS.NONE);
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
        await endTurn();
    };

    const payRent = async () => {
        const player = getCurrentPlayer();
        if (!player || actionRequired !== ACTIONS.PAY_RENT || !activeTile) return addLog("Cannot pay rent now.");
        
        try {
            const res = await fetch(`${API}/pay-rent`, { 
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    player_id: player.id, 
                    property_position: activeTile.position // Assuming backend needs this
                }),
                credentials: 'include',
            });
            const data = await res.json();

            if (res.ok) {
                addLog(`💸 Paid $${data.amount} rent to ${data.owner_name}.`);
                
                if (data.eliminated_player_id) {
                     addLog(`😭 ${data.payer_name} has been eliminated!`);
                     await endTurn(data.eliminated_player_id); 
                   } else {
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
        const player = getCurrentPlayer();
        if (!player || actionRequired !== ACTIONS.TAX || !activeTile) return addLog("Cannot pay tax now.");
        
        try {
            const res = await fetch(`${API}/pay-tax`, { 
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    player_id: player.id, 
                    tax_position: activeTile.position // Assuming backend needs this
                }),
                credentials: 'include',
            });
            const data = await res.json();

            if (res.ok) {
                addLog(`💵 Paid $${data.amount} in taxes.`);
                setActionRequired(ACTIONS.NONE);
                await fetchGameState();
            } else {
                addLog(`Tax Failed: ${data.error}`);
            }
        } catch (err) {
            addLog("Error paying tax.");
        }
    };
    
    const goToJail = async () => {
        const player = getCurrentPlayer();
        if (!player) return;
        
        try {
            const res = await fetch(`${API}/go-to-jail`, { 
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ player_id: player.id }),
                credentials: 'include',
            });
            const data = await res.json();

            if (res.ok) {
                addLog(`🚨 Go directly to Jail. Do not pass Go. Do not collect $200.`);
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
            const res = await fetch(`${API}/cards/draw/${deck}`, { 
                method: 'POST',
                credentials: 'include',
            });
            const data = await res.json();

            if (res.ok) {
                setActiveCard(data.card);
                addLog(`🃏 Drew a ${deck} Card: ${data.card.text}`);
                
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
        // Run checkSession on mount, which handles fetching game state on success.
        checkSession();
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
                isCurrentPlayerTurn,
                canPerformAction,
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
