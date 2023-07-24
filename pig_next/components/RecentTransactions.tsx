import useRecentTransactions from "../hooks/useRecentTransactions";
import { Transaction } from "../types";
import TransactionCard from "./TransactionCard";

function RecentTransactions() {
  const { data: transactions, isLoading } = useRecentTransactions();

  return (
    <div className="flex w-full flex-col gap-4">
      <span className="text-stone-500">Recent transactions</span>
      <div className="flex h-0 flex-grow flex-col gap-4 overflow-y-auto">
        {isLoading ? (
          <span className="animate-pulse">...</span>
        ) : transactions?.length === 0 ? (
          <span className="text-sm text-stone-200">No transactions</span>
        ) : (
          transactions
            ?.sort((_a: Transaction, _b: Transaction) => {
              return new Date(_a.date) > new Date(_b.date) ? -1 : 1;
            })
            .map((transaction) => (
              <TransactionCard
                key={`${transaction.date}-${transaction.balance}`}
                type={transaction.destinationIdentifierType}
                username={transaction.destinationIdentifier}
                date={new Date(transaction.date).toLocaleDateString()}
                amount={String(transaction.balance)}
              />
            ))
        )}
      </div>
    </div>
  );
}

export default RecentTransactions;
