function Card({ type, content }: { type: string; content: string }) {
  return (
    <div className="flex w-full flex-col items-center gap-4 overflow-hidden rounded-lg border-2 border-stone-700 border-opacity-50 bg-opacity-20 px-2 py-4">
      <span className="font-bold text-stone-500 opacity-50">{type}</span>
      <span className="w-fit truncate text-lg font-medium text-pink-400">
        {content}
      </span>
    </div>
  );
}

export default Card;
