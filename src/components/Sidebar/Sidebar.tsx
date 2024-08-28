import React, { useState } from "react";
import { assets } from "../../assets/assets";

const Sidebar = () => {
  const [extended, setExtended] = useState<boolean>(false);

  return (
    <div className={`min-h-screen inline-flex flex-col justify-between bg-[#f0f4f9] p-6 transition-all ease-in-out duration-300 ${
      extended ? "w-64" : "w-24"
    }`}>
      <div className="">
        <img
          className="w-5 h-5 block ml-2.5 cursor-pointer"
          src={assets.menu_icon}
          alt=""
          onClick={()=>{setExtended((prev)=>!prev)}}
        />
        <div className="mt-12 p-2 inline-flex items-center gap-2.5 px-2 py-2 bg-[#e6eaf1] rounded-[50px] text-sm text-gray-400 cursor-pointer">
          {/* // new Chat */}
          <img className="w-5 h-6" src={assets.plus_icon} alt="" />
          {extended ? <p>New Chat</p> : null}
        </div>
        {extended ? (
          <div className="flex flex-col">
            {/* // recent */}
            <p className="mt-7 mb-5">
              {/* recent title */}
              Recent
            </p>
            <div className="flex items-start gap-2.5 p-2.5 pr-10 rounded-[50px] text-[#282828] cursor-pointer hover:bg-[#e2e6eb]">
              <img className="w-5" src={assets.message_icon} alt="" />
              <p>What is react ...</p>
            </div>
          </div>
        ) : null}
      </div>
      <div className="flex flex-col">
        <div className="flex items-center gap-2.5 p-2.5 pr-2.5 rounded-[50px] text-[#282828] cursor-pointer hover:bg-[#e2e6eb]">
          {/* bottom */}
          <img className="w-5 h-5" src={assets.question_icon} alt="" />
          {extended ? <p>Help</p> : null }
        </div>
        <div className="flex items-center gap-2.5 p-2.5 pr-2.5 rounded-[50px] text-[#282828] cursor-pointer hover:bg-[#e2e6eb]">
          {/* bottom */}
          <img className="w-5 h-5" src={assets.history_icon} alt="" />
          { extended ? <p>Activity</p> : null }
        </div>
        <div className="flex items-center gap-2.5 p-2.5 pr-2.5 rounded-[50px] text-[#282828] cursor-pointer hover:bg-[#e2e6eb]">
          {/* bottom */}
          <img className="w-5 h-5 " src={assets.setting_icon} alt="" />
          {extended ? <p>Settings</p> : null }
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
