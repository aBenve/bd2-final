"use client";

import useBalance from "../hooks/useBalance";

function Balance() {
  const { data: balance, isLoading } = useBalance();

  const addDotsToNumber = (number: number) => {
    // the number could have decimals
    const [integer, decimals] = number.toString().split(".");
    const integerWithDots = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return decimals ? `${integerWithDots},${decimals}` : integerWithDots;
  };

  return (
    <div className="flex w-full flex-col justify-center gap-2 overflow-hidden">
      <span className="max-w-[90%] text-5xl font-bold text-stone-100">
        $
        {isLoading ? (
          <span className="animate-pulse">...</span>
        ) : (
          <span>{addDotsToNumber(balance) ?? 0}</span>
        )}
      </span>
      <span className="text-sm text-stone-200">Available balance</span>
    </div>
  );
}

export default Balance;
