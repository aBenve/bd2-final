"use client";
import { useUserAuth } from "../store/userStore";
import Balance from "./Balance";

function Header() {
  const { user } = useUserAuth();

  return (
    <div className="flex w-full flex-col gap-8">
      <div className="flex flex-col gap-4">
        <span className="max-w-[90%] truncate text-stone-500 ">
          Hi {user?.name}
        </span>
        <Balance />
      </div>
    </div>
  );
}

export default Header;
