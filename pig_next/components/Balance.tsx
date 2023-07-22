"use client";

function Balance() {
  return (
    <div className="flex w-full flex-col justify-center gap-2 overflow-hidden">
      <span className="max-w-[90%] text-5xl font-bold text-stone-100">
        $1000000
      </span>
      <span className="text-sm text-stone-200">Available balance</span>
    </div>
  );
}

export default Balance;
