function TransactionCard({
  type,
  username,
  date,
  amount,
}: {
  type: string;
  username: string;
  date: string;
  amount: string;
}) {
  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex items-center justify-between rounded-lg bg-stone-900 px-4 py-4">
        <div className="flex max-w-[70%] flex-col gap-1">
          <div className="flex items-center gap-4">
            <span className="text-sm text-stone-500">{type}</span>
            <span className="text-sm text-stone-400">{date}</span>
          </div>
          <span className="truncate text-stone-200">{username}</span>
        </div>
        <span className="max-w-[30%] truncate text-xl font-semibold text-pink-400">
          ${amount}
        </span>
      </div>
    </div>
  );
}

export default TransactionCard;
