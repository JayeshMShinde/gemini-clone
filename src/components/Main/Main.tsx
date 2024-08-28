import React, { useContext } from "react";
import { assets } from "../../assets/assets";
import { Context } from "../../context/context";

const Main = () => {
  const context = useContext(Context);

  if (!context) {
    return <div>Error: Context not available</div>;
  }

  const {
    onSent,
    recentPrompt,
    showResult,
    loading,
    resultData,
    setInput,
    input,
  } = context;

  return (
    <>
      <div className="flex-1 min-h-screen relative pb-[15vh]">
        <div className="flex items-center justify-between p-5 text-md text-[#585858]">
          <p>Gemini</p>
          <img className="w-10 rounded-full" src={assets.user_icon} alt="" />
        </div>
        <div className="max-w-[900px] m-auto">
          {!showResult ? (
            <>
              <div className="mt-12 mb-12 text-6xl text-[#c4c7c5] font-semibold p-5">
                <p>
                  <span className="bg-clip-text bg-gradient-to-r from-[#4b90ff] to-[#ff5546]  text-transparent">
                    Hello, Dev.
                  </span>
                </p>
                <p>How can I help you today?</p>
              </div>
              <div className="grid grid-cols-4 gap-3 p-5">
                <div className="h-[200px] p-4 bg-[#f0f4f9] rounded-xl relative cursor-pointer hover:bg-[#dfe4ea]">
                  <p className="text-[#585858] text-md">
                    Show me how to build something by hand
                  </p>
                  <img
                    className="w-9 p-1.5 absolute bg-white rounded-[20px] bottom-2.5 right-2.5"
                    src={assets.compass_icon}
                    alt=""
                  />
                </div>
                <div className="h-[200px] p-4 bg-[#f0f4f9] rounded-xl relative cursor-pointer hover:bg-[#dfe4ea]">
                  <p className="text-[#585858] text-md">
                    Give me tips to help care for a tricky plant
                  </p>
                  <img
                    className="w-9 p-1.5 absolute bg-white rounded-[20px] bottom-2.5 right-2.5"
                    src={assets.bulb_icon}
                    alt=""
                  />
                </div>
                <div className="h-[200px] p-4 bg-[#f0f4f9] rounded-xl relative cursor-pointer hover:bg-[#dfe4ea]">
                  <p className="text-[#585858] text-md">
                    Come up with a product name for a new app
                  </p>
                  <img
                    className="w-9 p-1.5 absolute bg-white rounded-[20px] bottom-2.5 right-2.5"
                    src={assets.message_icon}
                    alt=""
                  />
                </div>
                <div className="h-[200px] p-4 bg-[#f0f4f9] rounded-xl relative cursor-pointer hover:bg-[#dfe4ea]">
                  <p className="text-[#585858] text-md">
                    Explain how something works like an engineer
                  </p>
                  <img
                    className="w-9 p-1.5 absolute bg-white rounded-[20px] bottom-2.5 right-2.5"
                    src={assets.code_icon}
                    alt=""
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="px-0 py-[5%] min-h-[70vh] overflow-y-hidden">
                <div className="mx-10 my-0 flex items-start gap-5 mb-10">
                  <img
                    className="rounded-[50px] w-10"
                    src={assets.user_icon}
                    alt=""
                  />
                  <p className="">{recentPrompt}</p>
                </div>
                <div className="mx-10 my-0 flex items-start gap-5">
                  <img
                    className="rounded-[50px] w-10"
                    src={assets.gemini_icon}
                    alt=""
                  />
                  {loading ? (
                    <>
                      <div className="w-full flex-col gap-5">
                        <hr className="rounded-md border-none bg-[#f6f7f8] bg-gradient-to-r from-[#9ed7ff] from-10% via-[#ffffff]  via-30% to-[#9ed7ff] to-90% h-5 mb-2"/>
                        <hr className="rounded-md border-none bg-[#f6f7f8] bg-gradient-to-r from-[#9ed7ff] from-10% via-[#ffffff]  via-30% to-[#9ed7ff] to-90% h-5 mb-2"/>
                        <hr className="rounded-md border-none bg-[#f6f7f8] bg-gradient-to-r from-[#9ed7ff] from-10% via-[#ffffff]  via-30% to-[#9ed7ff] to-90% h-5 mb-2"/>
                      </div>
                    </>
                  ) : (
                    <>
                      <p
                        className="text-md leading-7"
                        dangerouslySetInnerHTML={{
                          __html: resultData as string,
                        }}
                      ></p>
                    </>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
        <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-[900px] px-0 py-5">
          <div className="flex items-center justify-between gap-4 bg-[#f0f4f9] px-2.5 py-2 rounded-[50px]">
            <input
              onChange={(e) => setInput(e.target.value)}
              value={input}
              className="flex-1 bg-transparent border-none outline-none p-2 text-md"
              type="text"
              placeholder="Enter a prompt here ..."
            />
            <div className="flex items-center gap-3">
              <img
                className="w-5 cursor-pointer"
                src={assets.gallery_icon}
                alt="Gallery"
              />
              <img
                className="w-5 cursor-pointer"
                src={assets.mic_icon}
                alt="Mic"
              />
              <img
                className="w-5 cursor-pointer"
                src={assets.send_icon}
                alt="Send"
                onClick={() => onSent(input as string)}
              />
            </div>
          </div>
          <p className="text-sm mx-3 my-auto p-1 items-center text-center">
            Gemini may display inaccurate info, including about people, so
            double-check its responses. Your privacy and Gemini Apps.
          </p>
        </div>
      </div>
    </>
  );
};

export default Main;
