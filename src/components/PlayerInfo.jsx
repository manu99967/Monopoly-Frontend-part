
// src/components/PlayerInfo.jsx
export default function PlayerInfo({ players, currentPlayer }) {
  return (
    <div className="flex flex-col gap-2">
      {players.map((p, i) => (
        <div
          key={p.id}
          className={`p-2 rounded border ${
            i === currentPlayer ? "bg-yellow-200 border-yellow-500" : "bg-white"
          }`}
        >
          <span className="font-bold">{p.name}</span>
          <div>Money: ${p.money}</div>
          <div>Properties: {(p.properties || []).map((prop) => prop.name).join(", ") || "None"}</div>
        </div>
      ))}
    </div>
  );
}
