import Header from "../components/Header";

export default function Home() {
  return (
    <main className="mx-auto grid h-[100vh] w-full grid-cols-1 grid-rows-[repeat(3,auto)_1fr_auto] gap-8 overflow-hidden bg-stone-900 px-4 py-14 sm:w-[640px]">
      {/* <Header /> */}
      <div className="flex w-full flex-col gap-8">
        <div className="flex flex-col gap-4">
          <span className="max-w-[90%] truncate  text-xl text-stone-500 ">
            Hi username
          </span>
          <div className="flex w-full flex-col justify-center gap-2 overflow-hidden">
            <span className="max-w-[90%] text-5xl font-bold text-stone-100">
              $1000000
            </span>
            <span className="text-sm text-stone-200">Available balance</span>
          </div>
        </div>
      </div>
      <hr className="h-0.5 w-full rounded-full border-stone-600 bg-stone-600 opacity-50" />
      <div className="grid w-full grid-flow-row grid-cols-2 grid-rows-2 gap-4">
        <div className="flex w-full flex-col items-center gap-4 overflow-hidden rounded-lg bg-pink-500 bg-opacity-20 px-2 py-4">
          <span className="font-bold text-pink-500">CBU</span>
          <span className="truncate text-xl font-medium text-stone-100">
            1234567890
          </span>
        </div>
        <div className="flex w-full flex-col items-center gap-4 overflow-hidden rounded-lg bg-pink-500 bg-opacity-20 px-2 py-4">
          <span className="font-bold text-pink-500">ALIAS</span>
          <span className="truncate text-xl font-medium text-stone-100">
            benve_capo
          </span>
        </div>
        <div className="flex w-full flex-col items-center gap-4 overflow-hidden rounded-lg bg-pink-500 bg-opacity-20 px-2 py-4">
          <span className="font-bold text-pink-500">PHONE</span>
          <span className="truncate text-xl font-medium text-stone-100">
            112155123
          </span>
        </div>
        <div className="flex w-full flex-col items-center gap-4 overflow-hidden rounded-lg bg-pink-500 bg-opacity-20 px-2 py-4">
          <span className="font-bold text-pink-500">EMAIL</span>
          <span className="w-full truncate text-xl font-medium text-stone-100">
            abenve@gmail.comasdadsas
          </span>
        </div>
      </div>
      <div className="flex w-full flex-col gap-4">
        <span className="text-stone-500">Recent transactions</span>
        <div className="flex h-0 flex-grow flex-col gap-4 overflow-y-auto">
          <div className="flex w-full flex-col gap-4">
            <div className="flex items-center justify-between rounded-lg bg-stone-800 px-4 py-4">
              <div className="flex max-w-[70%] flex-col gap-1">
                <div className="flex items-center gap-4">
                  <span className="text-sm text-stone-500">ALIAS</span>
                  <span className="text-sm text-stone-400">12/1/1234</span>
                </div>
                <span className="truncate text-stone-200">benve</span>
              </div>
              <span className="max-w-[30%] truncate text-xl font-semibold text-pink-400">
                $10000000000000000000000000000
              </span>
            </div>
          </div>
          <div className="flex w-full flex-col gap-4">
            <div className="flex items-center justify-between rounded-lg bg-stone-800 px-4 py-4">
              <div className="flex max-w-[70%] flex-col gap-1">
                <div className="flex items-center gap-4">
                  <span className="text-sm text-stone-500">ALIAS</span>
                  <span className="text-sm text-stone-400">12/1/1234</span>
                </div>
                <span className="truncate text-stone-200">benve</span>
              </div>
              <span className="max-w-[30%] truncate text-xl font-semibold text-pink-400">
                $10000000000000000000000000000
              </span>
            </div>
          </div>
          <div className="flex w-full flex-col gap-4">
            <div className="flex items-center justify-between rounded-lg bg-stone-800 px-4 py-4">
              <div className="flex max-w-[70%] flex-col gap-1">
                <div className="flex items-center gap-4">
                  <span className="text-sm text-stone-500">ALIAS</span>
                  <span className="text-sm text-stone-400">12/1/1234</span>
                </div>
                <span className="truncate text-stone-200">benve</span>
              </div>
              <span className="max-w-[30%] truncate text-xl font-semibold text-pink-400">
                $10000000000000000000000000000
              </span>
            </div>
          </div>
          <div className="flex w-full flex-col gap-4">
            <div className="flex items-center justify-between rounded-lg bg-stone-800 px-4 py-4">
              <div className="flex max-w-[70%] flex-col gap-1">
                <div className="flex items-center gap-4">
                  <span className="text-sm text-stone-500">ALIAS</span>
                  <span className="text-sm text-stone-400">12/1/1234</span>
                </div>
                <span className="truncate text-stone-200">benve</span>
              </div>
              <span className="max-w-[30%] truncate text-xl font-semibold text-pink-400">
                $10000000000000000000000000000
              </span>
            </div>
          </div>
          <div className="flex w-full flex-col gap-4">
            <div className="flex items-center justify-between rounded-lg bg-stone-800 px-4 py-4">
              <div className="flex max-w-[70%] flex-col gap-1">
                <div className="flex items-center gap-4">
                  <span className="text-sm text-stone-500">ALIAS</span>
                  <span className="text-sm text-stone-400">12/1/1234</span>
                </div>
                <span className="truncate text-stone-200">benve</span>
              </div>
              <span className="max-w-[30%] truncate text-xl font-semibold text-pink-400">
                $10000000000000000000000000000
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className=" flex h-full w-full flex-col gap-4">
        <span className="text-stone-500">Make a transaction</span>
        <form className="flex w-full items-center gap-4">
          <select className="block h-[3rem] rounded-lg bg-stone-800  px-4 py-2 text-pink-400 focus:outline-none ">
            <option value="volvo">Phone</option>
            <option value="saab">Email</option>
            <option value="saab">Name</option>
            <option value="saab">Cbu</option>
          </select>
          <input
            className="h-[3rem] w-full rounded-lg bg-stone-800
            px-4 py-2 text-xl text-stone-100  focus:outline-none"
          />
        </form>
      </div>
    </main>
  );
}
