import { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import jwtDecode from "jwt-decode";
import { v4 as uuidv4 } from "uuid";
import { Camera, Save, Upload } from "lucide-react";

import { API_BASE_URL } from "../../config";
import { resolveProfilePic } from "../../shared/imageFallbacks";
import { change_tag, change_username, option_profile_pic } from "../../store/userCredsSlice";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { getSupabaseBucket, supabase } from "../../lib/supabaseClient";

function isHttpUrl(value) {
  if (!value) return false;
  return value.startsWith("https://") || value.startsWith("http://");
}

async function uploadProfilePic(file) {
  if (!supabase || !file) return "";

  const bucket = getSupabaseBucket();
  const fileExt = file.name.split(".").pop()?.toLowerCase() || "png";
  const filePath = `profile-pics/${uuidv4()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (uploadError) {
    throw new Error("Failed to upload image");
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
  return data?.publicUrl || "";
}

export default function SettingsDialog({ triggerClassName, icon: Icon }) {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user_info);

  const [open, setOpen] = useState(false);
  const [displayName, setDisplayName] = useState(user.username || "");
  const [profileUrl, setProfileUrl] = useState(user.profile_pic || "");
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const effectivePreview = useMemo(() => {
    return previewUrl || profileUrl || resolveProfilePic(user.profile_pic, user.username);
  }, [previewUrl, profileUrl, user.profile_pic, user.username]);

  const reset = () => {
    setDisplayName(user.username || "");
    setProfileUrl(user.profile_pic || "");
    setFile(null);
    setPreviewUrl("");
    setSaving(false);
    setError("");
  };

  const save = async () => {
    const nextName = String(displayName || "").trim().replace(/\s+/g, " ");
    const nextUrl = String(profileUrl || "").trim();

    if (nextName.length < 2 || nextName.length > 32) {
      setError("Name must be 2–32 characters.");
      return;
    }

    if (nextUrl && !isHttpUrl(nextUrl) && !file) {
      setError("Profile image must be an http(s) URL, or upload a file.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      let finalProfilePic = nextUrl;
      if (file) {
        finalProfilePic = await uploadProfilePic(file);
      }

      const res = await fetch(`${API_BASE_URL}/profile`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": localStorage.getItem("token"),
        },
        body: JSON.stringify({
          username: nextName,
          profile_pic: finalProfilePic || "",
        }),
      });
      const data = await res.json();
      if (data.status !== 200 || !data.token) {
        setError(data.message || "Failed to update profile.");
        setSaving(false);
        return;
      }

      localStorage.setItem("token", data.token);
      const decoded = jwtDecode(data.token);
      dispatch(change_username(decoded.username));
      dispatch(change_tag(decoded.tag));
      dispatch(option_profile_pic(decoded.profile_pic));

      setOpen(false);
      reset();
    } catch {
      setError("Failed to update profile.");
      setSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (nextOpen) reset();
      }}
    >
      <button
        type="button"
        className={triggerClassName}
        onClick={() => setOpen(true)}
        title="Settings"
        aria-label="Settings"
      >
        {Icon ? <Icon className="h-4 w-4" /> : null}
      </button>

      <DialogContent className="max-w-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <DialogTitle>Settings</DialogTitle>
            <DialogDescription className="mt-2">
              Update your display name and profile photo.
            </DialogDescription>
          </div>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-[140px_1fr]">
          <div className="space-y-3">
            <div className="relative h-28 w-28 overflow-hidden rounded-3xl border border-white/10 bg-black/30">
              <img
                src={effectivePreview}
                alt=""
                className="h-full w-full object-cover"
              />
            </div>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-extrabold tracking-wider text-white/75 transition hover:bg-white/10">
              <Upload className="h-4 w-4" />
              Upload
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const nextFile = e.target.files?.[0];
                  if (!nextFile) return;
                  setFile(nextFile);
                  setPreviewUrl(URL.createObjectURL(nextFile));
                }}
              />
            </label>
            <div className="text-xs font-semibold text-white/45">
              {supabase
                ? "Uploads are stored in Supabase."
                : "No upload provider configured — use an image URL."}
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <div className="text-xs font-extrabold tracking-widest text-white/45">
                DISPLAY NAME
              </div>
              <Input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your name"
              />
            </div>

            <div className="space-y-2">
              <div className="text-xs font-extrabold tracking-widest text-white/45">
                PROFILE PHOTO URL
              </div>
              <div className="relative">
                <Camera className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/45" />
                <Input
                  value={profileUrl}
                  onChange={(e) => setProfileUrl(e.target.value)}
                  placeholder="https://…"
                  className="pl-11"
                  disabled={Boolean(file)}
                />
              </div>
              {file ? (
                <div className="text-xs font-semibold text-white/45">
                  Using uploaded file (URL field disabled).
                </div>
              ) : null}
            </div>

            {error ? (
              <div className="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-200">
                {error}
              </div>
            ) : null}
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              setOpen(false);
              reset();
            }}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button type="button" onClick={save} disabled={saving}>
            <Save className="h-4 w-4" />
            {saving ? "Saving…" : "Save changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
