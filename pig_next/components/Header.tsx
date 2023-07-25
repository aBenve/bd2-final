"use client";
import { useUserAuth } from "../store/userStore";
import Balance from "./Balance";

function Header() {
  const { user, logout } = useUserAuth();

  return (
    <div className="flex w-full flex-col gap-8">
      <div className="flex flex-col gap-4">
        <div className="flex w-full justify-between">
          <span className="max-w-[90%] truncate text-stone-500 ">
            Hi {user?.name}
          </span>
          <button
            onClick={logout}
            className="rounded-lg border-2 border-solid border-pink-400 px-2 py-1 text-pink-400 transition duration-300 ease-in-out hover:bg-pink-400 hover:bg-opacity-30"
          >
            Logout
          </button>
        </div>
        <Balance />
      </div>
    </div>
  );
}

export default Header;
