import TransactionCard from "./TransactionCard";

function RecentTransactions() {
  return (
    <div className="flex w-full flex-col gap-4">
      <span className="text-stone-500">Recent transactions</span>
      <div className="flex h-0 flex-grow flex-col gap-4 overflow-y-auto">
        <TransactionCard
          type="ALIAS"
          username="benve"
          date="12/1/1234"
          amount="10000000000000000000000000000"
        />
        <TransactionCard
          type="ALIAS"
          username="benve"
          date="12/1/1234"
          amount="10000000000000000000000000000"
        />
        <TransactionCard
          type="ALIAS"
          username="benve"
          date="12/1/1234"
          amount="10000000000000000000000000000"
        />
        <TransactionCard
          type="ALIAS"
          username="benve"
          date="12/1/1234"
          amount="10000000000000000000000000000"
        />
      </div>
    </div>
  );
}

export default RecentTransactions;
