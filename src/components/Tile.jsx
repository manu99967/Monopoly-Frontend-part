export default function Tile({ tile, orientation, players = [], currentPlayer }) {
  const colors = {
    brown: "bg-amber-900",
    lightblue: "bg-sky-300",
    pink: "bg-pink-400",
    orange: "bg-orange-400",
    red: "bg-red-500",
    yellow: "bg-yellow-300",
    green: "bg-green-500",
    darkblue: "bg-blue-900 text-white",
  };

  return (
    <div
      className="border border-black flex flex-col items-center justify-between text-[10px] font-bold bg-white p-1 relative"
      style={{
        writingMode: orientation === "left" ? "vertical-rl" : "horizontal-tb",
        width: tile.id % 10 === 0 ? "80px" : undefined,
        height: tile.id % 10 === 0 ? "80px" : undefined,
      }}
    >
      {/* Property color strip */}
      {tile.color && (
        <div
          className={`w-full h-2 ${colors[tile.color]} mb-1`}
          style={{ writingMode: "horizontal-tb" }}
        ></div>
      )}

      {/* Tile Name */}
      <div className="text-center leading-tight">{tile.name}</div>

      {/* Property Owner */}
      {tile.owner !== null && (
        <div className="text-[8px] text-blue-700 font-semibold mt-0.5">
          Owned by {tile.ownerName || `P${tile.owner + 1}`}
        </div>
      )}

      {/* Tile Price */}
      {tile.price && (
        <div className="text-[8px] font-normal mt-1">${tile.price}</div>
      )}

      {/* Player Tokens */}
      <div className="absolute inset-0 flex flex-wrap justify-center items-center p-1 gap-1 pointer-events-none z-10">
        {players.map((p) => (
          <div
            key={p.id}
            className={`w-4 h-4 rounded-full border-2 shadow-md flex items-center justify-center text-xs font-bold ${
              p.id === currentPlayer?.id
                ? "border-yellow-400 ring-2 ring-yellow-400 animate-pulse"
                : "border-black"
            }`}
            style={{ backgroundColor: p.color || p.player_color || '#999' }}
            title={p.name}
          >
            {p.name.charAt(0).toUpperCase()}
          </div>
        ))}
      </div>
    </div>
  );
}
