import invalid_chat_image from "../../../images/invalid_server.svg";

function InvalidChat() {
  return (
    <div className="grid h-full min-h-[420px] place-items-center p-6">
      <div className="max-w-md rounded-3xl border border-white/10 bg-black/35 p-6 text-center shadow-soft backdrop-blur-xl">
        <img
          src={invalid_chat_image}
          alt="invalid-chat"
          className="mx-auto h-44 w-auto opacity-90"
        />
        <div className="mt-5 text-sm font-extrabold tracking-widest text-brand-300">
          NO TEXT CHANNELS
        </div>
        <div className="mt-3 text-sm text-white/60">
          You find yourself in a strange place. You don’t have access to any
          text channels or there are none in this server.
        </div>
      </div>
    </div>
  );
}

export default InvalidChat;
