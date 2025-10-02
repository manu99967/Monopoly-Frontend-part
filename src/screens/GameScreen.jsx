
import { useState, useEffect } from "react";
import Board from "../components/Board";
import Dice from "../components/Dice";
import LogPanel from "../components/LogPanel";
import PlayerInfo from "../components/PlayerInfo";
import WinModal from "../components/WinModal";
import CardModal from "../components/CardModal";
import BuyModal from "../components/BuyModal"; // popup for buying
import { boardData } from "../data/boardData";
import { chanceCards, communityChestCards } from "../data/card";

export default function GameScreen() {
  const [players, setPlayers] = useState([
    { id: 1, name: "Player 1", position: 0, money: 1500, color: "red", properties: [], inJail: false },
    { id: 2, name: "Player 2", position: 0, money: 1500, color: "blue", properties: [], inJail: false },
  ]);

  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [dice, setDice] = useState([1, 1]);
  const [rolling, setRolling] = useState(false);
  const [log, setLog] = useState([]);
  const [winner, setWinner] = useState(null);
  const [card, setCard] = useState(null);
  const [buyTile, setBuyTile] = useState(null);

  // Check for winner
  useEffect(() => {
    const alive = players.filter((p) => p.money > 0);
    if (alive.length === 1) setWinner(alive[0]);
  }, [players]);

  // Roll dice
  const rollDice = () => {
    if (rolling) return;
    setRolling(true);

    // If in jail, skip movement
    if (players[currentPlayer].inJail) {
      setLog((prev) => [
        ...prev,
        `${players[currentPlayer].name} is in jail and skips this turn.`,
      ]);
      setPlayers((prev) =>
        prev.map((p, i) =>
          i === currentPlayer ? { ...p, inJail: false } : p
        )
      );
      setCurrentPlayer((prev) => (prev + 1) % players.length);
      setRolling(false);
      return;
    }

    // Dice animation
    const animationTime = 500;
    const intervalTime = 100;
    let elapsed = 0;

    const interval = setInterval(() => {
      setDice([Math.ceil(Math.random() * 6), Math.ceil(Math.random() * 6)]);
      elapsed += intervalTime;
      if (elapsed >= animationTime) clearInterval(interval);
    }, intervalTime);

    setTimeout(() => {
      clearInterval(interval);
      const d1 = Math.ceil(Math.random() * 6);
      const d2 = Math.ceil(Math.random() * 6);
      const steps = d1 + d2;
      setDice([d1, d2]);

      setPlayers((prev) => {
        const updated = prev.map((p, i) =>
          i === currentPlayer ? { ...p, position: (p.position + steps) % 40 } : p
        );

        const tile = boardData[updated[currentPlayer].position];

        setLog((prevLog) => [
          ...prevLog,
          `${updated[currentPlayer].name} rolled ${d1} + ${d2} = ${steps}, landed on ${tile.name}`,
        ]);

        // Chance / Community Chest
        if (tile.type === "chance") {
          const cardIndex = Math.floor(Math.random() * chanceCards.length);
          setCard(chanceCards[cardIndex]);
        } else if (tile.type === "community") {
          const cardIndex = Math.floor(Math.random() * communityChestCards.length);
          setCard(communityChestCards[cardIndex]);
        }
        // Property tiles: trigger Buy Modal if unowned
        else if (tile.price && !tile.owner) {
          setBuyTile(tile);
        }
        // Rent
        else if (tile.price && tile.owner && tile.owner !== updated[currentPlayer].id) {
          const ownerIndex = updated.findIndex((p) => p.id === tile.owner);
          const rent = Math.floor(tile.price / 2);
          updated[currentPlayer].money -= rent;
          updated[ownerIndex].money += rent;
          setLog((prev) => [
            ...prev,
            `${updated[currentPlayer].name} paid $${rent} rent to ${updated[ownerIndex].name}`,
          ]);
        }
        // Jail
        if (tile.type === "jail") {
          updated[currentPlayer].inJail = true;
          setLog((prev) => [...prev, `${updated[currentPlayer].name} goes to Jail!`]);
        }

        // Bankruptcy check
        updated.forEach((p) => {
          if (p.money < 0) {
            setLog((prevLog) => [
              ...prevLog,
              `${p.name} went bankrupt! All properties returned.`,
            ]);
            p.properties.forEach((prop) => {
              prop.owner = null;
            });
            p.money = 0;
            p.properties = [];
          }
        });

        return updated;
      });

      setCurrentPlayer((prev) => (prev + 1) % players.length);
      setRolling(false);
    }, animationTime);
  };

  // Buy property
  const buyProperty = (tile) => {
    setPlayers((prev) =>
      prev.map((p, i) =>
        i === currentPlayer
          ? {
              ...p,
              money: p.money - tile.price,
              properties: [...p.properties, tile],
            }
          : p
      )
    );
    tile.owner = players[currentPlayer].id;
    setLog((prev) => [
      ...prev,
      `${players[currentPlayer].name} bought ${tile.name} for $${tile.price}`,
    ]);
    setBuyTile(null);
  };

  // Skip buying property
  const skipProperty = () => {
    setLog((prev) => [
      ...prev,
      `${players[currentPlayer].name} chose not to buy ${buyTile.name}`,
    ]);
    setBuyTile(null);
  };

  // Apply card effect
  const applyCard = (effect) => {
    setPlayers((prev) =>
      prev.map((p, i) =>
        i === currentPlayer ? effect(p) : p
      )
    );
    setCard(null);
  };

  return (
    <div className="flex h-screen bg-green-100">
      {/* Board */}
      <div className="flex-1 flex items-center justify-center p-4">
        <Board players={players} />
      </div>

      {/* Side Panel */}
      <div className="w-80 p-4 bg-white shadow-xl flex flex-col gap-4">
        <h1 className="text-2xl font-bold mb-4 text-center">Monopoly</h1>
        <PlayerInfo players={players} currentPlayer={currentPlayer} />
        <Dice dice={dice} rolling={rolling} onRoll={rollDice} />
        <LogPanel log={log} />
      </div>

      {/* Buy Modal */}
      {buyTile && (
        <BuyModal
          tile={buyTile}
          onBuy={() => buyProperty(buyTile)}
          onSkip={skipProperty}
        />
      )}

      {/* Card Modal */}
      {card && (
        <CardModal
          card={card}
          onApply={() => applyCard(card.action)}
          onClose={() => setCard(null)}
        />
      )}

      {/* Winner Modal */}
      {winner && <WinModal winner={winner} onRestart={() => window.location.reload()} />}
    </div>
  );
}
