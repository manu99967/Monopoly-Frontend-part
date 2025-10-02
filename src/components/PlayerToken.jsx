


export default function PlayerToken({ player, style }) {
  return (
    <div
      className="w-6 h-6 rounded-full border-2 border-black transition-all duration-500 ease-in-out absolute"
      style={{
        backgroundColor: player.color,
        transform: `translate(${(player.id - 1) * 10}px, 0)`, // separate overlapping tokens
        ...style,
      }}
      title={player.name}
    ></div>
  );
}
