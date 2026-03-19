import { useSelector } from "react-redux";
import { resolveProfilePic } from "../../../shared/imageFallbacks";

function RightnavChat() {
  const all_users = useSelector((state) => state.currentPage.members);
  const onlineUsers = useSelector((state) => state.presence.byId);

  return (
    <div className="h-full p-4">
      <div className="text-xs font-extrabold tracking-widest text-white/45">
        ALL MEMBERS — {all_users.length}
      </div>
      <div className="mt-3 space-y-2">
        {all_users.map((elem) => {
          const memberId = String(elem.user_id || elem._id || elem.id);
          const isOnline = Boolean(onlineUsers[memberId]);

          return (
            <div
              className="flex items-center gap-3 rounded-2xl border border-transparent px-3 py-2 text-sm font-semibold text-white/80 transition hover:border-white/10 hover:bg-white/5"
              key={elem.user_id || elem._id || elem.user_name}
            >
              <div className="relative h-10 w-10 overflow-visible rounded-2xl border border-white/10 bg-black/40">
                <div className="h-10 w-10 overflow-hidden rounded-2xl">
                  <img
                    src={resolveProfilePic(elem.user_profile_pic, elem.user_name)}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </div>
                <span
                  className={[
                    "absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-panel2",
                    isOnline ? "bg-emerald-400" : "bg-white/20",
                  ].join(" ")}
                />
              </div>
              <div className="min-w-0 truncate">{elem.user_name}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default RightnavChat;
