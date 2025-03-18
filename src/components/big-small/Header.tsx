
import React from "react";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const Header = () => {
  return (
    <div className="flex items-center p-4 border-b border-purple-500/10">
      <Link to="/" className="p-2 rounded-lg bg-[#252547] text-purple-400 hover:bg-[#2f2f5a] transition-colors button-press">
        <ArrowLeft size={20} />
      </Link>
      <div className="ml-4 flex flex-col">
        <span className="text-xs text-purple-300 tracking-wide">GAME</span>
        <h1 className="text-xl font-bold text-white">Big & Small</h1>
      </div>
    </div>
  );
};

export default Header;
