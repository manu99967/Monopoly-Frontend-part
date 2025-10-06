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
    skipBuyAndEndTurn, 
    actionRequired,
    // 🔑 NEW: Functions to check user authorization
    isCurrentPlayerTurn,
    canPerformAction,
    getCurrentPlayer,
  } = useGame();

  const [winner, setWinner] = useState(null);

// --- State and Effect Management ---

  // 🏁 Check for a winner
  useEffect(() => {
    // Filter out players with zero or less money (eliminated)
    const alive = players.filter((p) => p.money > 0); 
    if (alive.length === 1 && !winner) { // Only set winner if one is left and none is set yet
        setWinner(alive[0]);
    } else if (alive.length > 1 && winner) {
        setWinner(null); // Clear winner if more than one is left (e.g., restart)
    }
  }, [players, winner]);

  const currentPlayerData = getCurrentPlayer(); // Get the current player object

// --- Handler Functions (Frontend Logic) ---

  // 🎲 Handle rolling
  const handleRoll = async () => {
    // Block rolling if currently rolling or if it's not this user's turn
    if (rolling || !canPerformAction(ACTIONS.ROLL)) return;
    await rollDice();
  };

  // 💰 Handle buying (Used for the 'Buy' button in BuyModal)
  const handleBuy = async () => {
    // Block buying if it's not this user's turn or if there's no active tile to buy
    if (!canPerformAction(ACTIONS.BUY) || !activeTile) return;
    await buyProperty(activeTile.position); 
  };

  // ❌ Skip buying (Used for the 'Skip' button in BuyModal)
  const handleSkipBuy = async () => {
    // Block skipping if it's not this user's turn
    if (!canPerformAction(ACTIONS.BUY)) return;
    await skipBuyAndEndTurn(); 
  };

  // 🃏 Apply card effects (Used for the 'OK' button in CardModal)
  const handleApplyCard = async () => {
    // Check if the current player is the one who should be resolving the card
    const isCardAction = actionRequired === ACTIONS.CHANCE || actionRequired === ACTIONS.COMMUNITY_CHEST;

    if (!isCurrentPlayerTurn() || !isCardAction || !activeCard) return;

    setActiveCard(null);
    // After card is cleared, the turn must end to continue the game
    await endTurn(); 
  };

  // 🔄 End turn (Manual fallback button)
  const handleEndTurn = async () => {
    // Block manual end turn if it's not their turn or action is not NONE
    if (!isCurrentPlayerTurn() || actionRequired !== ACTIONS.NONE) return;
    await endTurn();
  };


// --- Component Rendering ---

    // 🔑 Derived states to control UI visibility and enablement (The missing link!)
    const canRoll = canPerformAction(ACTIONS.ROLL);
    const showBuyModal = activeTile && canPerformAction(ACTIONS.BUY);
    const showCardModal = activeCard && (actionRequired === ACTIONS.CHANCE || actionRequired === ACTIONS.COMMUNITY_CHEST);
    const showEndTurnButton = isCurrentPlayerTurn() && actionRequired === ACTIONS.NONE;


  return (
    <div className="flex h-screen bg-green-100">
      {/* 🟩 Game Board + Dice Info */}
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        {/* Show current player and dice roll result above board */}
        <div className="mb-4 text-center">
          <h2 className="text-xl font-bold text-blue-700">
            Turn: {currentPlayerData?.name || "?"}
          </h2>
          <div className="text-lg mt-2">
            🎲 Dice: {dice[0]} + {dice[1]} = <span className="font-bold">{dice[0] + dice[1]}</span>
          </div>
        </div>
        {/* Pass currentPlayer to Board for highlighting */}
        <Board players={players} currentPlayer={currentPlayer} />
      </div>

      {/* 📋 Side Panel */}
      <div className="w-80 p-4 bg-white shadow-xl flex flex-col gap-4">
        <h1 className="text-2xl font-bold mb-4 text-center">Monopoly</h1>

        {/* Current Player Info */}
        <PlayerInfo players={players} currentPlayer={currentPlayer} />

        {/* Dice controls */}
        <div className="flex flex-col items-center gap-2">
          {/* 🔑 Dice is disabled unless canRoll is true */}
          <Dice 
            dice={dice} 
            rolling={rolling} 
            onRoll={handleRoll} 
            disabled={!canRoll} 
          />
          {/* Manual End Turn is only visible when the conditions are met */}
          {showEndTurnButton && (
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

      {/* 🏠 Buy Modal: Only show if canPerformAction(ACTIONS.BUY) is true */}
     {showBuyModal && (
        <BuyModal 
          tile={activeTile} 
          onBuy={handleBuy} 
          onSkip={handleSkipBuy} 
          currentPlayerData={currentPlayerData} 
        />
      )}

      {/* 🎴 Card Modal: Only show if a card is active and actionRequired matches */}
      {showCardModal && (
        <CardModal
          card={activeCard}
          onApply={handleApplyCard} 
          onClose={handleApplyCard} 
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
