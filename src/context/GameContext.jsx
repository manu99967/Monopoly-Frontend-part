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
    const [isGameOver, setIsGameOver] = useState(false); // 🔑 NEW STATE: Game Over Flag
    
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
    // INITIAL FETCH
    // -----------------------------
    const fetchGameState = async () => {
        try {
            const [playersRes, stateRes] = await Promise.all([
                fetch(`${API}/players`),
                fetch(`${API}/game-state`),
            ]);
            const playersData = await playersRes.json();
            const stateData = await stateRes.json();

            // 🔑 Check if game is over immediately after fetching players
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
        fetchGameState();
    }, []);

    // -----------------------------
    // END TURN / NEXT TURN 🔑 UPDATED LOGIC
    // -----------------------------
    // Pass the eliminated player's ID to help the backend find the *next* player index
    const endTurn = async (eliminatedPlayerId = null) => { 
        // 🔑 Prevent turn cycle if game is over
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
                // 🔑 Pass eliminated ID (though the backend's logic handles it robustly now)
                body: JSON.stringify({ eliminated_player_id: eliminatedPlayerId }),
            });
            const data = await res.json();

            if (data.error) {
                 // The backend will return an error if it hits the end of the line (e.g., only one player left)
                addLog(data.error);
                if (data.error.includes("Game Over")) {
                    setIsGameOver(true);
                }
            } else {
                setCurrentPlayer(data.current_player);
                addLog(`🔄 Next turn: Player ${data.current_player + 1}`);
            }

            // Always fetch fresh player data (important for elimination cleanup)
            const playersRes = await fetch(`${API}/players`);
            const playersData = await playersRes.json();
            setPlayers(playersData);

            // 🔑 FINAL CHECK: If player list is now 1, set game over.
            if (playersData.length === 1 && !isGameOver) {
                setIsGameOver(true);
                addLog(`🏆 ${playersData[0].name} wins!`);
            }

        } catch (err) {
            console.error(err);
            addLog("Error ending turn");
        }
        
        // Set the next action to ROLL for the new player (only if game isn't over)
        if (!isGameOver) {
            setActionRequired(ACTIONS.ROLL); 
        }
    };
    
    // -----------------------------
    // AUTOMATIC ACTIONS (Rent, Tax, Jail)
    // -----------------------------

    // 🔑 UPDATED FUNCTION: Pay Rent - Handles Bankruptcy
    const payRent = async (playerId, propertyPosition) => {
        try {
            const res = await fetch(`${API}/pay-rent`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ player_id: playerId, property_position: propertyPosition }), 
            });
            const data = await res.json();

            if (data.error) {
                addLog(`❌ ${data.error}`);
                await endTurn();
            } else if (data.eliminated_player_id) { // 🔑 BANKRUPTCY CHECK
                addLog(`💥 Player ${data.eliminated_player_id} is out! ${data.message}`);
                
                // Update owner's money (owner is still in the game)
                if (data.owner) {
                    updatePlayerState(data.owner); 
                }
                
                // If the backend says the game is over, set the flag
                if (data.game_over) {
                    setIsGameOver(true);
                }

                // Call endTurn to cycle to the next *remaining* player
                await endTurn(data.eliminated_player_id); 
                
            } else {
                // Standard transaction
                setPlayers((prev) => {
                    const updated = [...prev];
                    const payerIndex = updated.findIndex((p) => p.id === data.payer.id);
                    const ownerIndex = updated.findIndex((p) => p.id === data.owner.id);
                    if (payerIndex >= 0) updated[payerIndex] = data.payer;
                    if (ownerIndex >= 0) updated[ownerIndex] = data.owner;
                    return updated;
                });
                addLog(`🏠 ${data.message}`);
                await endTurn();
            }
        } catch (err) {
            console.error(err);
            addLog("⚠️ Error paying rent");
            await endTurn();
        }
    };

    // 🔑 UPDATED FUNCTION: Pay Tax - Handles Bankruptcy
    const payTax = async (playerId, taxPosition) => {
        try {
            const res = await fetch(`${API}/pay-tax`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ player_id: playerId, tax_position: taxPosition }),
            });
            const data = await res.json();

            if (data.error) {
                addLog(`❌ ${data.error}`);
            } else if (data.eliminated_player_id) { // 🔑 BANKRUPTCY CHECK
                addLog(`💥 Player ${data.eliminated_player_id} is out! ${data.message}`);
                
                // If the backend says the game is over, set the flag
                if (data.game_over) {
                    setIsGameOver(true);
                }
                
                // Call endTurn to cycle to the next *remaining* player
                await endTurn(data.eliminated_player_id);
                
            } else {
                updatePlayerState(data.player);
                addLog(`💸 ${data.message}`);
                await endTurn(); // Standard turn end
            }
        } catch (err) {
            console.error(err);
            addLog("⚠️ Error paying tax");
            await endTurn();
        }
    };

    // 🔑 COMPLETED FUNCTION: Go To Jail (No bankruptcy check needed, money isn't lost here)
    const goToJail = async (playerId) => {
        try {
            const res = await fetch(`${API}/go-to-jail`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ player_id: playerId }),
            });
            const data = await res.json();

            if (data.error) {
                addLog(`❌ ${data.error}`);
            } else {
                updatePlayerState(data.player);
                addLog(`🚨 ${data.message}`);
            }
        } catch (err) {
            console.error(err);
            addLog("⚠️ Error sending player to jail");
        }
        endTurn();
    };

    // ----------------------------------------------------
    // 🎲 ROLL DICE & MOVE PLAYER (Logic unchanged, relies on the updated action handlers)
    // ----------------------------------------------------
    const rollDice = async () => {
        if (actionRequired !== ACTIONS.ROLL || rolling || isGameOver) return; // 🔑 Check isGameOver
        
        const current = players[currentPlayer];
        if (!current) {
            addLog("⚠️ Error: No current player found.");
            return;
        }
        
        setRolling(true);
        setActionRequired(ACTIONS.NONE); // Temporarily lock all actions

        try {
            // STEP 1: Call /roll-dice to move the player and get dice values
            const rollRes = await fetch(`${API}/roll-dice`, { 
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ player_id: current.id }),
            });
            const rollData = await rollRes.json();

            if (rollData.error || rollData.message?.includes("turn")) {
                addLog(`❌ ${rollData.error || rollData.message}`);
                setActionRequired(ACTIONS.ROLL);
                setRolling(false);
                return;
            }

            setDice(rollData.dice);
            updatePlayerState(rollData.player);
            addLog(rollData.message);


            // STEP 2: Call /land-on-tile to determine the action required
            const landRes = await fetch(`${API}/land-on-tile`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ player_id: rollData.player.id }),
            });
            const landData = await landRes.json();
            
            if (landData.error) {
                addLog(`❌ Land-on-tile Error: ${landData.error}`);
                endTurn(); 
                return;
            }

            setActiveTile(landData.tile || null);
            updatePlayerState(landData.player); 
            addLog(`[Tile Action] ${landData.message}`);

            // --- Doubles Check ---
            if (rollData.rolled_doubles) {
                setActionRequired(ACTIONS.ROLL); 
                addLog("🎲 Rolled doubles! Roll again.");
                setRolling(false);
                return; 
            }

            // --- Handle Action Based on Backend Response ---
            const action = landData.action_needed;
            
            switch (action) {
                case ACTIONS.BUY:
                    setActionRequired(ACTIONS.BUY); 
                    break;
                    
                case ACTIONS.PAY_RENT:
                    if (landData.tile) {
                        await payRent(landData.player.id, landData.tile.position);
                    } else {
                        addLog("⚠️ Error: Cannot pay rent, property position missing.");
                        endTurn();
                    }
                    break;
                    
                case ACTIONS.GO_TO_JAIL:
                    await goToJail(landData.player.id);
                    break;

                case ACTIONS.TAX: 
                    if (landData.tile) {
                        await payTax(landData.player.id, landData.tile.position);
                    } else {
                        addLog("⚠️ Error: Cannot pay tax, tile position missing.");
                        endTurn();
                    }
                    break;
                    
                case ACTIONS.CHANCE:
                case ACTIONS.COMMUNITY_CHEST:
                    await drawCard(); 
                    setActionRequired(action); 
                    break;
                    
                case ACTIONS.NONE:
                case ACTIONS.OWNED: 
                default:
                    endTurn();
                    break;
            }

        } catch (err) {
            console.error(err);
            addLog("⚠️ Critical error during roll sequence.");
            setActionRequired(ACTIONS.ROLL); 
        }

        setRolling(false);
    };
    
    // -----------------------------
    // BUY PROPERTY (Logic unchanged)
    // -----------------------------
    const buyProperty = async (tile) => {
        // ... (existing implementation) ...
        try {
            const current = players[currentPlayer];
            if (!current) return;

            const res = await fetch(`${API}/buy-property`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    player_id: current.id,
                    property_position: tile.position, 
                }),
            });
            const data = await res.json();

            if (data.error) {
                addLog(`❌ ${data.error}`);
                endTurn();
            } else {
                updatePlayerState(data.player); 
                setActiveTile(null); 
                addLog(`💰 ${data.message}`);
                setActionRequired(ACTIONS.ROLL); 
                await endTurn(); 
            }
        } catch (err) {
            console.error(err);
            addLog("⚠️ Error buying property");
            await endTurn();
        }
    };

    // 🟢 CRITICAL HANDLER: Handles skipping the purchase and advancing the turn (Logic unchanged)
    const skipBuyAndEndTurn = async () => {
        addLog("⏭️ Player skipped buying the property. Auction is next (if implemented).");
        setActiveTile(null); // Clear the modal display
        await endTurn(); 
    };

    // -----------------------------
    // DRAW CARD (Logic unchanged)
    // -----------------------------
    const drawCard = async () => {
        try {
            const res = await fetch(`${API}/cards/draw`, { method: "POST" });
            const card = await res.json();
            setActiveCard(card);
            addLog(`🎴 Card drawn: ${card.text || card.effect}`);
        } catch (err) {
            console.error(err);
            addLog("⚠️ Error drawing card");
        }
    };


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
                payTax, // 🔑 Export payTax
                goToJail, // 🔑 Export goToJail
                drawCard,
                actionRequired, 
                isGameOver, // 🔑 EXPORT NEW STATE
            }}
        >
            {children}
        </GameContext.Provider>
    );
}

export const useGame = () => useContext(GameContext);