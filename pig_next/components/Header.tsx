import axios from "axios";
import { useQuery } from "react-query";
import Balance from "./Balance";

function Header() {
  return (
    <div className="flex w-full flex-col gap-8">
      <div className="flex flex-col gap-4">
        <span className="max-w-[90%] truncate text-stone-500 ">
          Hi username
        </span>
        <Balance />
      </div>
    </div>
  );
}

export default Header;
