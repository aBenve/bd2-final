import Image from "next/image";
import logo from "../public/pig.png";

function Header() {
  return (
    <nav className="flex justify-between items-center w-full px-4 py-2 bg-stone-800">
      <div className="flex items-center">
        <Image src={logo} alt="pig" className="w-10 h-10 mr-2 rounded-full" />
        <h1 className="text-2xl font-bold text-white">PIG</h1>
      </div>
      <div className="flex items-center">
        <button className="px-4 py-2 text-white bg-pink-500 rounded-md">
          Sign in
        </button>
      </div>
    </nav>
  );
}

export default Header;
