
export default function Tile({ tile, orientation, players = [] }) {
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
      <div className="text-center">{tile.name}</div>

      {/* Tile Price */}
      {tile.price && <div className="text-[8px] font-normal mt-1">${tile.price}</div>}

      {/* Player Tokens */}
      <div className="absolute inset-0 flex flex-wrap justify-center items-end p-1 gap-1 pointer-events-none">
        {players.map((p) => (
          <div
            key={p.id}
            className="w-4 h-4 rounded-full border-2 border-black"
            style={{ backgroundColor: p.color }}
            title={p.name}
          />
        ))}
      </div>
    </div>
  );
}
