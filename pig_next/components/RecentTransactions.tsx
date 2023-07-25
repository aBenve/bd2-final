import useRecentTransactions from "../hooks/useRecentTransactions";
import { useUserAuth } from "../store/userStore";
import { Transaction } from "../types";
import TransactionCard from "./TransactionCard";

function RecentTransactions() {
  const { data: transactions, isLoading } = useRecentTransactions();
  const { user } = useUserAuth();

  const isReceivedTransaction = (transaction: Transaction) => {
    return (
      user &&
      transaction.destinationIdentifier ===
        user[transaction.destinationIdentifierType as keyof typeof user]
    );
  };

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
                isReceived={isReceivedTransaction(transaction) ?? false}
                destinationType={transaction.destinationIdentifierType}
                destinationUsername={transaction.destinationIdentifier}
                originType={transaction.originIdentifierType}
                originUsername={transaction.originIdentifier}
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
