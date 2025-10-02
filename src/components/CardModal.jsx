export default function CardModal({ card, onClose, onBuy }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl w-80 text-center">
        <h2 className="text-xl font-bold mb-4">{card.name}</h2>
        <p className="mb-4">Price: ${card.price}</p>
        <button
          onClick={() => { onBuy(card); onClose(); }}
          className="px-4 py-2 bg-green-500 text-white rounded mr-2"
        >
          Buy
        </button>
        <button
          onClick={onClose}
          className="px-4 py-2 bg-red-500 text-white rounded"
        >
          Skip
        </button>
      </div>
    </div>
  );
}


