import Tile from "./Tile";
import { boardData } from "../data/boardData";
import logo from "../assets/monopoly-logo.png";

export default function Board({ players }) {
  const bottom = boardData.slice(0, 11);
  const left = boardData.slice(11, 20);
  const top = boardData.slice(20, 31).reverse();
  const right = boardData.slice(31, 40).reverse();

  // Get players on a specific tile
  const getPlayersOnTile = (tileIndex) =>
    players.filter((p) => p.position === tileIndex);

  return (
    <div className="flex justify-center items-center p-4">
      <div className="grid grid-cols-[repeat(11,80px)] grid-rows-[repeat(11,80px)] border-4 border-black bg-green-200 relative">
        {/* Top Tiles */}
        {top.map((tile, i) => (
          <Tile
            key={`top-${i}`}
            tile={tile}
            orientation="top"
            players={getPlayersOnTile(tile.id)}
          />
        ))}

        {/* Right Tiles */}
        {right.map((tile, i) => (
          <Tile
            key={`right-${i}`}
            tile={tile}
            orientation="right"
            players={getPlayersOnTile(tile.id)}
          />
        ))}

        {/* Bottom Tiles */}
        {bottom.map((tile, i) => (
          <Tile
            key={`bottom-${i}`}
            tile={tile}
            orientation="bottom"
            players={getPlayersOnTile(tile.id)}
          />
        ))}

        {/* Left Tiles */}
        {left.map((tile, i) => (
          <Tile
            key={`left-${i}`}
            tile={tile}
            orientation="left"
            players={getPlayersOnTile(tile.id)}
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



