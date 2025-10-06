import Tile from "./Tile";
import { boardData } from "../data/boardData"; // Assuming this is the full 40-tile array
import logo from "../assets/monopoly-logo.png";

export default function Board({ players, currentPlayer }) {
  // --- Standard Monopoly Board Layout ---
  // The full boardData array is 40 tiles long (index 0 to 39).
  // When slicing, we need to know the original index for position tracking.
  // bottom: 0 to 10 (11 tiles)
  // left: 11 to 19 (9 tiles)
  // top: 20 to 30 (11 tiles)
  // right: 31 to 39 (9 tiles)

  const bottom = boardData.slice(0, 11); // Index 0-10
  const left = boardData.slice(11, 20); // Index 11-19
  const top = boardData.slice(20, 31).reverse(); // Index 30 down to 20 (Note the reverse)
  const right = boardData.slice(31, 40).reverse(); // Index 39 down to 31 (Note the reverse)

  /**
   * @description Filters the players array to find who is currently standing on a given tile position.
   * @param {number} tilePosition The index of the tile on the board (0-39).
   * @returns {Array} List of players on that tile.
   */
  const getPlayersOnTile = (tilePosition) =>
    players.filter((p) => p.position === tilePosition);

  // Helper to calculate the original board index for reversed arrays
  const getTopTileIndex = (i) => 30 - i; // 30, 29, 28, ... 20
  const getRightTileIndex = (i) => 39 - i; // 39, 38, 37, ... 31

  return (
    <div className="flex justify-center items-center p-4">
      <div className="grid grid-cols-[repeat(11,80px)] grid-rows-[repeat(11,80px)] border-4 border-black bg-green-200 relative">
        {/* Top Tiles (Index 30 down to 20, rendered from left-to-right on screen) */}
        {top.map((tile, i) => (
          <Tile
            key={`top-${tile.name}-${i}`}
            tile={tile}
            orientation="top"
            players={getPlayersOnTile(getTopTileIndex(i))}
            currentPlayer={currentPlayer}
          />
        ))}

        {/* Right Tiles (Index 39 down to 31, rendered from top-to-bottom on screen) */}
        {right.map((tile, i) => (
          <Tile
            key={`right-${tile.name}-${i}`}
            tile={tile}
            orientation="right"
            players={getPlayersOnTile(getRightTileIndex(i))}
            currentPlayer={currentPlayer}
          />
        ))}

        {/* Bottom Tiles (Index 0 to 10, rendered from left-to-right on screen) */}
        {bottom.map((tile, i) => (
          <Tile
            key={`bottom-${tile.name}-${i}`}
            tile={tile}
            orientation="bottom"
            players={getPlayersOnTile(i)}
            currentPlayer={currentPlayer}
          />
        ))}

        {/* Left Tiles (Index 11 to 19, rendered from bottom-to-top on screen) */}
        {left.map((tile, i) => (
          <Tile
            key={`left-${tile.name}-${i}`}
            tile={tile}
            orientation="left"
            players={getPlayersOnTile(11 + i)}
            currentPlayer={currentPlayer}
          />
        ))}

        {/* Center Logo */}
        <div className="col-span-9 row-span-9 col-start-2 row-start-2 flex items-center justify-center bg-green-300 relative">
          <img
            src={logo}
            alt="Monopoly Logo"
            className="w-[350px] drop-shadow-lg transform rotate-[-10deg]"
          />
        </div>
      </div>
    </div>
  );
}
