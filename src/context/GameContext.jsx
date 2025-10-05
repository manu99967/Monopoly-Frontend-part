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
    // END TURN / NEXT TURN
    // -----------------------------
    const endTurn = async () => {
        // Reset active states before fetching next player
        setActiveTile(null);
        setActiveCard(null);

        try {
            const res = await fetch(`${API}/next_turn`, { 
                method: "POST",
            });
            const data = await res.json();

            if (data.error) {
                addLog(data.error);
            } else {
                setCurrentPlayer(data.current_player);
                addLog(`🔄 Next turn: Player ${data.current_player + 1}`);
            }

            const playersRes = await fetch(`${API}/players`);
            const playersData = await playersRes.json();
            setPlayers(playersData);
        } catch (err) {
            console.error(err);
            addLog("Error ending turn");
        }
        
        // Set the next action to ROLL for the new player (CRITICAL for unsticking the dice)
        setActionRequired(ACTIONS.ROLL); 
    };
    
    // -----------------------------
    // AUTOMATIC ACTIONS (Rent, Tax, Jail)
    // -----------------------------

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
                // If rent fails (e.g., bankruptcy), the turn still ends
                await endTurn();
            } else {
                setPlayers((prev) => {
                    const updated = [...prev];
                    const payerIndex = updated.findIndex((p) => p.id === data.payer.id);
                    const ownerIndex = updated.findIndex((p) => p.id === data.owner.id);
                    if (payerIndex >= 0) updated[payerIndex] = data.payer;
                    if (ownerIndex >= 0) updated[ownerIndex] = data.owner;
                    return updated;
                });
                addLog(`🏠 ${data.message}`);
                // Rent paid successfully, end the turn
                await endTurn();
            }
        } catch (err) {
            console.error(err);
            addLog("⚠️ Error paying rent");
            await endTurn();
        }
    };

    // 🔑 COMPLETED FUNCTION: Pay Tax
    const payTax = async (playerId, taxPosition) => {
        try {
            // NOTE: Assuming your Flask API handles the tax calculation internally
            const res = await fetch(`${API}/pay-tax`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ player_id: playerId, tax_position: taxPosition }),
            });
            const data = await res.json();

            if (data.error) {
                addLog(`❌ ${data.error}`);
            } else {
                updatePlayerState(data.player);
                addLog(`💸 ${data.message}`);
            }
        } catch (err) {
            console.error(err);
            addLog("⚠️ Error paying tax");
        }
        // CRITICAL: Tax payment is automatic and ends the turn.
        await endTurn();
    };

    // 🔑 COMPLETED FUNCTION: Go To Jail
    const goToJail = async (playerId) => {
        try {
            // NOTE: Assuming your Flask API handles moving the player to position 10 and setting in_jail=true
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
        // CRITICAL: Going to jail is automatic and ends the turn.
        endTurn();
    };

    // ----------------------------------------------------
    // 🎲 ROLL DICE & MOVE PLAYER
    // ----------------------------------------------------
    const rollDice = async () => {
        if (actionRequired !== ACTIONS.ROLL || rolling) return; 
        
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

            // Update state with final player and tile data
            setActiveTile(landData.tile || null);
            updatePlayerState(landData.player); 
            addLog(`[Tile Action] ${landData.message}`);

            // --- Doubles Check (If your backend supports returning 'rolled_doubles') ---
            if (rollData.rolled_doubles) {
                // Keep the turn on the current player and allow another roll
                setActionRequired(ACTIONS.ROLL); 
                addLog("🎲 Rolled doubles! Roll again.");
                setRolling(false);
                return; 
            }

            // --- Handle Action Based on Backend Response ---
            const action = landData.action_needed;
            
            switch (action) {
                case ACTIONS.BUY:
                    // INTERACTIVE: Show Buy Modal
                    setActionRequired(ACTIONS.BUY); 
                    break;
                    
                case ACTIONS.PAY_RENT:
                    // AUTOMATIC: Pay rent and end turn
                    // Ensure landData.tile is available here to get position
                    if (landData.tile) {
                        await payRent(landData.player.id, landData.tile.position);
                    } else {
                        addLog("⚠️ Error: Cannot pay rent, property position missing.");
                        endTurn();
                    }
                    break;
                    
                case ACTIONS.GO_TO_JAIL:
                    // AUTOMATIC: Send player to jail and end turn
                    await goToJail(landData.player.id);
                    break;

                case ACTIONS.TAX: 
                    // AUTOMATIC: Pay tax and end turn
                    // Ensure landData.tile is available here to get position
                    if (landData.tile) {
                        await payTax(landData.player.id, landData.tile.position);
                    } else {
                        addLog("⚠️ Error: Cannot pay tax, tile position missing.");
                        endTurn();
                    }
                    break;
                    
                case ACTIONS.CHANCE:
                case ACTIONS.COMMUNITY_CHEST:
                    // INTERACTIVE: Draw card and wait for resolution in CardModal
                    await drawCard(); 
                    setActionRequired(action); 
                    break;
                    
                case ACTIONS.NONE:
                case ACTIONS.OWNED: 
                default:
                    // Passive tiles (Go, Free Parking, etc.) - end turn
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
    // BUY PROPERTY
    // -----------------------------
    const buyProperty = async (tile) => {
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
                setActiveTile(null); // Close the modal
                addLog(`💰 ${data.message}`);

                setActionRequired(ACTIONS.ROLL); 
                // Turn is over after a successful purchase.
                await endTurn(); 
            }
        } catch (err) {
            console.error(err);
            addLog("⚠️ Error buying property");

            await endTurn();
        }
    };

    // 🟢 CRITICAL HANDLER: Handles skipping the purchase and advancing the turn
    const skipBuyAndEndTurn = async () => {
        addLog("⏭️ Player skipped buying the property. Auction is next (if implemented).");
        setActiveTile(null); // Clear the modal display
        await endTurn(); // CRITICAL: Ends the turn and sets actionRequired to ACTIONS.ROLL for the next player.
    };

    // -----------------------------
    // DRAW CARD
    // -----------------------------
    const drawCard = async () => {
        try {
            const res = await fetch(`${API}/cards/draw`, { method: "POST" });
            const card = await res.json();
            setActiveCard(card);
            // NOTE: The CardModal handles the resolution (applying effects and calling endTurn)
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
                drawCard,
                actionRequired, 
            }}
        >
            {children}
        </GameContext.Provider>
    );
}

export const useGame = () => useContext(GameContext);