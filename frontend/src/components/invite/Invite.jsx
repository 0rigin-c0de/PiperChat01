import { useCallback, useEffect, useState } from "react";
import logo from "../../images/discord_logo_3.png";
import { useParams } from "react-router-dom";
import invalid_link_image from "../../images/invalid_invite.svg";
import jwt from "jwt-decode";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";

function Invite() {
  const navigate = useNavigate();
  const token1 = localStorage.getItem("token");
  const user_creds = token1 ? jwt(token1) : null;
  const { username, tag, profile_pic, id } = user_creds || {};

  const { invite_link } = useParams();
  const url = import.meta.env.VITE_URL;
  const [invite_details, setinvite_details] = useState(null);
  const [invalid_invite_link, setinvalid_invite_link] = useState(null);

  const [already_member, setAlreadyMember] = useState(false);   // 403 from backend
  const [accept_failed, setAcceptFailed] = useState(false);     // 500 or network error
  const [accepting, setAccepting] = useState(false);            // loading state on button




  const accept_invite = async () => {

    setAccepting(true);
    setAcceptFailed(false);

    try {
      const res = await fetch(`${url}/accept_invite`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": localStorage.getItem("token"),
        },
        body: JSON.stringify({
          user_details: { username, tag, profile_pic, id },
          server_details: { invite_details },
        }),
      });
      const data = await res.json();
      if (data.status == 200) {
        navigate("/channels/@me", { replace: true });
      }else if(data.status === 403){
        setAlreadyMember(true);
      }else{
        setAcceptFailed(true);
      }
    } catch {
      setAcceptFailed(true);
    }finally{
      setAccepting(false);
    }
  };

  const invite_link_info = useCallback(async () => {
    const res = await fetch(`${url}/invite_link_info`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-auth-token": localStorage.getItem("token"),
      },
      body: JSON.stringify({
        invite_link,
      }),
    });
    const data = await res.json();
    if (data.status == 200) {
      setinvite_details(data);
      setinvalid_invite_link(false);
    } else {
      setinvalid_invite_link(true);
    }
  }, [invite_link, url]);

  useEffect(() => {
    invite_link_info();
  }, [invite_link_info]);

  return (
    <div className="min-h-dvh bg-ink text-white">
      <div className="pointer-events-none fixed inset-0 bg-radial-glow" />
      <div className="pointer-events-none fixed inset-0 bg-grid-fade [background-size:36px_36px] opacity-15" />

      <div className="relative grid min-h-dvh place-items-center p-6">
        <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-black/40 p-6 shadow-soft backdrop-blur-xl sm:p-8">
   
          {invalid_invite_link == null ? (
            <div className="flex items-center gap-3 text-white/70">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-brand-400" />
              <div className="text-sm font-semibold">Loading invite…</div>
            </div>

          ) : invalid_invite_link == false ? (
            invite_details == null ? (
              <div className="flex items-center gap-3 text-white/70">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-brand-400" />
                <div className="text-sm font-semibold">Loading details…</div>
              </div>

            ) : already_member ? (
              //dedicated "already a member" state
              // shown when backend returns 403
              <div className="space-y-5 text-center">
                <div className="flex items-center justify-center">
                  <img src={logo} alt="PiperChat" className="h-12 w-12" />
                </div>
                <div className="text-xl font-extrabold tracking-tight">
                  You&aposre already a member
                </div>
                <div className="text-sm text-white/60">
                  You already belong to{" "}
                  <span className="font-bold text-white/85">
                    {invite_details.server_name}
                  </span>
                  . Head back to continue the conversation.
                </div>
                <Button
                  className="w-full"
                  size="lg"
                  onClick={() =>
                    navigate(
                      `/channels/${invite_details.server_id}`,
                      { replace: true }
                    )
                  }
                >
                  Go to server
                </Button>
                <Button
                  variant="secondary"
                  className="w-full"
                  size="lg"
                  onClick={() => navigate("/channels/@me", { replace: true })}
                >
                  Go to dashboard
                </Button>
              </div>

            ) : (
              //Valid invite, not yet a member
              <div className="space-y-6">
                <div className="flex items-center justify-center">
                  <img src={logo} alt="PiperChat" className="h-12 w-12" />
                </div>

                <div className="text-center">
                  <div className="text-xs font-extrabold tracking-widest text-white/50">
                    INVITE
                  </div>
                  <div className="mt-2 text-2xl font-extrabold tracking-tight">
                    {invite_details.inviter_name} invited you to join
                  </div>
                </div>

                <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="grid h-12 w-12 place-items-center overflow-hidden rounded-2xl border border-white/10 bg-black/40 text-lg font-black text-white">
                    {invite_details.server_pic == "" ? (
                      String(invite_details.server_name || "S")
                        .slice(0, 1)
                        .toUpperCase()
                    ) : (
                      <img
                        className="h-full w-full object-cover"
                        src={invite_details.server_pic}
                        alt=""
                      />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-extrabold text-white/85">
                      {invite_details.server_name}
                    </div>
                    <div className="mt-1 flex items-center gap-4 text-xs font-semibold text-white/50">
                      <span className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                        1 Online
                      </span>
                      <span className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-white/30" />
                        1 Member
                      </span>
                    </div>
                  </div>
                </div>

                {/*failure banner shown below server card when accept fails */}
                {accept_failed && (
                  <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                    Failed to join the server. Please try again.
                  </div>
                )}

                <Button
                  className="w-full"
                  size="lg"
                  //disabled while request is in flight
                  disabled={accepting}
                  onClick={() => {
                    if (!token1) {
                      navigate("/", { replace: true });
                      return;
                    }
                    if (invite_details.inviter_id == id) {
                      setAlreadyMember(true);
                    } else {
                      accept_invite();
                    }
                  }}
                >
                  {/* NEW: button text changes while loading */}
                  {accepting ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Joining…
                    </span>
                  ) : (
                    "Accept invite"
                  )}
                </Button>
              </div>
            )

          ) : (
            // ── Invalid link state (unchanged) ──
            <div className="space-y-5 text-center">
              <img
                src={invalid_link_image}
                alt=""
                className="mx-auto h-44 w-auto opacity-90"
              />
              <div className="text-xl font-extrabold tracking-tight">
                Invite invalid
              </div>
              <div className="text-sm text-white/60">
                This invite may be expired or you might not have permission to
                join.
              </div>
              <Button
                variant="secondary"
                className="w-full"
                size="lg"
                onClick={() => navigate("/", { replace: true })}
              >
                Continue to PiperChat
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Invite;
