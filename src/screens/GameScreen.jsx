import { useState, useEffect } from "react";
// Import your UI components
import Board from "../components/Board";
import Dice from "../components/Dice";
import LogPanel from "../components/LogPanel";
import PlayerInfo from "../components/PlayerInfo";
import WinModal from "../components/WinModal";
import CardModal from "../components/CardModal";
import BuyModal from "../components/BuyModal";
// ✅ Import all necessary context elements
import { useGame, ACTIONS } from "../context/GameContext"; 

export default function GameScreen() {
  const {
    players,
    currentPlayer,
    dice,
    rolling,
    rollDice,
    log,
    activeTile,
    setActiveTile, 
    buyProperty,
    activeCard,
    setActiveCard,
    endTurn,
    // 🔑 CRITICAL: Function to advance turn when skipping buy
    skipBuyAndEndTurn, 
    // 🔑 CRITICAL: State for controlling game flow/buttons
    actionRequired,
  } = useGame();

  const [winner, setWinner] = useState(null);

// --- State and Effect Management ---

  // 🏁 Check for a winner
  useEffect(() => {
    const alive = players.filter((p) => p.money > 0);
    if (alive.length === 1) setWinner(alive[0]); 
  }, [players]);

  const currentPlayerData = players[currentPlayer];

// --- Handler Functions (Frontend Logic) ---

  // 🎲 Handle rolling
  const handleRoll = async () => {
    if (rolling) return;
    // rollDice() handles the full sequence and sets the next actionRequired state
    await rollDice();
  };

  // 💰 Handle buying (Used for the 'Buy' button in BuyModal)
  const handleBuy = async () => {
    if (activeTile) {
      // buyProperty handles the purchase and calls endTurn() on success
      await buyProperty(activeTile); 
    }
  };

  // ❌ Skip buying (Used for the 'Skip' button in BuyModal)
  // 🔑 FIX 1: This uses the context function which clears the modal and calls endTurn().
  const handleSkipBuy = async () => {
    await skipBuyAndEndTurn(); 
  };

  // 🃏 Apply card effects (Used for the 'OK' button in CardModal)
  const handleApplyCard = async () => {
    if (activeCard) {
      // 1. Clear the active card to close the modal
      setActiveCard(null);

      // 2. 🔑 FIX 2: Must call endTurn() to clear actionRequired and advance the turn
      await endTurn(); 
    }
  };

  // 🔄 End turn (Manual fallback button)
  const handleEndTurn = async () => {
    await endTurn();
  };


// --- Component Rendering ---

  return (
    <div className="flex h-screen bg-green-100">
      {/* 🟩 Game Board */}
      <div className="flex-1 flex items-center justify-center p-4">
        <Board players={players} />
      </div>

      {/* 📋 Side Panel */}
      <div className="w-80 p-4 bg-white shadow-xl flex flex-col gap-4">
        <h1 className="text-2xl font-bold mb-4 text-center">Monopoly</h1>

        {/* Current Player Info */}
        <PlayerInfo players={players} currentPlayer={currentPlayer} />

        {/* Dice controls */}
        <div className="flex flex-col items-center gap-2">
          {/* 🔑 Control: Dice is disabled unless actionRequired is ACTIONS.ROLL */}
          <Dice 
            dice={dice} 
            rolling={rolling} 
            onRoll={handleRoll} 
            disabled={actionRequired !== ACTIONS.ROLL} // <--- Key to unsticking the dice
          />
          {/* Manual End Turn is only visible when the action is NONE (e.g., player landed on Free Parking) */}
          {actionRequired === ACTIONS.NONE && (
            <button
             onClick={handleEndTurn}
             className="px-4 py-2 rounded font-semibold bg-blue-500 hover:bg-blue-600 text-white"
            >
              End Turn
            </button>
          )}

        </div>

        <div className="text-center text-sm text-gray-600 mt-2">
          🎯 Current Action:{" "}
          <strong>
            {actionRequired}
          </strong>
        </div>

        {/* Game Log */}
        <LogPanel log={log} />
      </div>

      {/* 🏠 Buy Modal: Only show if actionRequired is BUY */}
     {activeTile && actionRequired === ACTIONS.BUY && (
        <BuyModal 
          tile={activeTile} 
          onBuy={handleBuy} 
          onSkip={handleSkipBuy} // Calls skipBuyAndEndTurn()
          currentPlayerData={currentPlayerData} 
        />
      )}

      {/* 🎴 Card Modal: Only show if actionRequired is CHANCE or COMMUNITY_CHEST */}
      {activeCard && (actionRequired === ACTIONS.CHANCE || actionRequired === ACTIONS.COMMUNITY_CHEST) && (
        <CardModal
          card={activeCard}
          onApply={handleApplyCard} // Calls handleApplyCard which calls endTurn()
          onClose={handleApplyCard} // Use the same handler for closing/resolving
        />
      )}

      {/* 🏆 Winner Modal */}
      {winner && (
        <WinModal
          winner={winner}
          onRestart={() => window.location.reload()}
       />
      )}
    </div>
  );
}