function MakeTransaction() {
  return (
    <div className=" flex h-full w-full flex-col gap-4">
      <span className="text-stone-500">Make a transaction</span>
      <form className="flex w-full flex-col items-center gap-4">
        <div className="flex w-full items-center gap-4">
          <select className="block h-[3rem] rounded-lg bg-stone-900  px-4 py-2 text-pink-400 focus:outline-none ">
            <option value="volvo">Phone</option>
            <option value="saab">Email</option>
            <option value="saab">Name</option>
            <option value="saab">Cbu</option>
          </select>
          <input
            placeholder="Enter an identifier"
            className="h-[3rem] w-full rounded-lg bg-stone-900
          px-4 py-2  text-stone-100  focus:outline-none"
          />
        </div>
        <input
          placeholder="Enter an amount"
          className="h-[3rem] w-full rounded-lg bg-stone-900
          px-4 py-2  text-stone-100  focus:outline-none"
        />
        <button
          type="submit"
          className="h-[3rem] w-full rounded-lg bg-pink-400
            px-4 py-2 font-bold text-stone-100  focus:outline-none"
        >
          Send
        </button>
      </form>
    </div>
  );
}

export default MakeTransaction;
