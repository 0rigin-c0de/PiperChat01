import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import jwt from "jwt-decode";
import { v4 as uuidv4 } from "uuid";
import { Save, Lock, Bell, User, Image, CheckCircle2, AlertCircle, Loader2, Pencil, UserPlus, Users, Mail } from "lucide-react";

import { API_BASE_URL } from "../../config";
import { resolveProfilePic, handleImageError } from "../../shared/imageFallbacks";
import { change_tag, change_username, option_profile_pic, set_notification_preferences } from "../../store/userCredsSlice";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Switch } from "../ui/switch";
import { getSupabaseBucket, supabase } from "../../lib/supabaseClient";

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
  console.log("Uploaded image URL:", data?.publicUrl);
  return data?.publicUrl || "";
}

function NotificationToggle({ label, description, checked, onChange, icon: Icon }) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-white/[0.03] px-4 py-3 transition-all duration-200 hover:bg-white/[0.06]">
      <div className="flex items-center gap-3">
        {Icon && <Icon className="h-4 w-4 text-white/40" />}
        <div>
          <div className="text-sm font-medium text-white/90">{label}</div>
          {description && <div className="text-xs text-white/40">{description}</div>}
        </div>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

function Message({ type, children }) {
  if (!children) return null;

  const styles = {
    error: "border-red-500/30 bg-red-500/10 text-red-300",
    success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  };

  const icons = {
    error: AlertCircle,
    success: CheckCircle2,
  };

  const Icon = icons[type];

  return (
    <div className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium ${styles[type]}`}>
      <Icon className="h-4 w-4" />
      {children}
    </div>
  );
}

function TabButton({ icon: Icon, label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2 rounded-t-lg px-3 py-2 text-xs font-semibold transition-all duration-200 border-b-2 ${
        active
          ? "bg-white/5 text-white border-violet-500"
          : "text-white/40 border-transparent hover:bg-white/5 hover:text-white/70"
      }`}
    >
      <Icon className={`h-3.5 w-3.5 ${active ? "text-violet-400" : "text-white/30"}`} />
      {label}
    </button>
  );
}

export default function SettingsDialog({ triggerClassName, icon: Icon }) {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user_info);

  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("user");
  const [displayName, setDisplayName] = useState(user.username || "");
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  const [notifDirectMessages, setNotifDirectMessages] = useState(
    user.notification_preferences?.direct_messages ?? true
  );
  const [notifFriendRequests, setNotifFriendRequests] = useState(
    user.notification_preferences?.friend_requests ?? true
  );
  const [notifServerMessages, setNotifServerMessages] = useState(
    user.notification_preferences?.server_messages ?? true
  );
  const [notifServerInvites, setNotifServerInvites] = useState(
    user.notification_preferences?.server_invites ?? true
  );
  const [savingNotifications, setSavingNotifications] = useState(false);
  const [notifSuccess, setNotifSuccess] = useState("");

  const effectivePreview = useMemo(() => {
    return previewUrl || resolveProfilePic(user.profile_pic, user.username);
  }, [previewUrl, user.profile_pic, user.username]);

  useEffect(() => {
    if (open && user.username) {
      setDisplayName(user.username);
    }
  }, [open, user.username]);

  const reset = () => {
    setDisplayName(user.username || "");
    setFile(null);
    setPreviewUrl("");
    setSaving(false);
    setError("");
    setSuccess("");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setPasswordError("");
    setPasswordSuccess("");
    setNotifDirectMessages(user.notification_preferences?.direct_messages ?? true);
    setNotifFriendRequests(user.notification_preferences?.friend_requests ?? true);
    setNotifServerMessages(user.notification_preferences?.server_messages ?? true);
    setNotifServerInvites(user.notification_preferences?.server_invites ?? true);
    setNotifSuccess("");
    setActiveTab("user");
  };

  const saveProfile = async () => {
    const nextName = String(displayName || "").trim().replace(/\s+/g, " ");

    if (nextName.length < 2 || nextName.length > 32) {
      setError("Name must be 2–32 characters.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      let finalProfilePic = user.profile_pic;
      if (file) {
        try {
          finalProfilePic = await uploadProfilePic(file);
        } catch {
          setError("Failed to upload image. Please try again.");
          setSaving(false);
          return;
        }
      }

      const res = await fetch(`${API_BASE_URL}/profile`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": localStorage.getItem("token") || "",
        },
        body: JSON.stringify({
          username: nextName,
          profile_pic: finalProfilePic || "",
        }),
      });

      let data;
      try {
        data = await res.json();
      } catch (jsonErr) {
        console.error("JSON parse error:", jsonErr);
        setError("The server returned an invalid response. Please try again.");
        setSaving(false);
        return;
      }

      if (!res.ok || data.status !== 200 || !data.token) {
        setError(data.message || `Failed to update profile (Status: ${res.status})`);
        setSaving(false);
        return;
      }

      localStorage.setItem("token", data.token);
      const decoded = jwt(data.token);
      
      // Update Redux with NEW data - use finalProfilePic if file was uploaded, otherwise use decoded value
      // Add timestamp to prevent browser image caching
      const timestamp = Date.now();
      const updatedProfilePic = file 
        ? `${finalProfilePic}?t=${timestamp}` 
        : decoded.profile_pic;
      dispatch(change_username(decoded.username));
      dispatch(change_tag(decoded.tag));
      dispatch(option_profile_pic(updatedProfilePic));

      setSuccess("Profile updated successfully!");
      setSaving(false);
      
      // Auto-close after success
      setTimeout(() => {
        setOpen(false);
        reset();
      }, 1000);
    } catch (err) {
      console.error("Profile update error:", err);
      setError(`Connection error: ${err.message || "Please check your network."}`);
      setSaving(false);
    }
  };

  const changePassword = async () => {
    setPasswordError("");
    setPasswordSuccess("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("All password fields are required.");
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    setChangingPassword(true);
    try {
      const res = await fetch(`${API_BASE_URL}/profile/password`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": localStorage.getItem("token"),
        },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
        }),
      });
      const data = await res.json();
      if (data.status !== 200) {
        setPasswordError(data.message || "Failed to change password.");
        setChangingPassword(false);
        return;
      }

      setPasswordSuccess("Password changed successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setChangingPassword(false);
    } catch {
      setPasswordError("Failed to change password.");
      setChangingPassword(false);
    }
  };

  const saveNotifications = async () => {
    setSavingNotifications(true);
    setError("");
    setNotifSuccess("");
    try {
      const res = await fetch(`${API_BASE_URL}/profile/notifications`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": localStorage.getItem("token"),
        },
        body: JSON.stringify({
          direct_messages: notifDirectMessages,
          friend_requests: notifFriendRequests,
          server_messages: notifServerMessages,
          server_invites: notifServerInvites,
        }),
      });
      const data = await res.json();
      if (data.status !== 200) {
        setError(data.message || "Failed to save notification preferences.");
      } else {
        dispatch(set_notification_preferences(data.notification_preferences));
        setNotifSuccess("Notification settings saved!");
      }
    } catch {
      setError("Failed to save notification preferences.");
    }
    setSavingNotifications(false);
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

      <DialogContent className="max-w-xl overflow-hidden border border-white/10 bg-[#0d0d0f] p-0 shadow-2xl">
        <DialogTitle className="sr-only">User Settings</DialogTitle>
        <DialogDescription className="sr-only">
          Manage your account profile, password, and notification preferences.
        </DialogDescription>
        <div className="flex h-[480px] max-h-[80vh] w-full flex-col">
          {/* Top Navigation */}
          <div className="border-b border-white/10 bg-white/[0.02] px-5 pt-5">
            <div className="mb-3">
              <h2 className="text-lg font-bold text-white">Settings</h2>
              <p className="text-xs text-white/40">Manage your account</p>
            </div>
            <nav className="-mb-px flex gap-1">
              <TabButton
                icon={User}
                label="User Profile"
                active={activeTab === "user"}
                onClick={() => setActiveTab("user")}
              />
              <TabButton
                icon={Lock}
                label="Password"
                active={activeTab === "password"}
                onClick={() => setActiveTab("password")}
              />
              <TabButton
                icon={Bell}
                label="Notifications"
                active={activeTab === "notifications"}
                onClick={() => setActiveTab("notifications")}
              />
            </nav>
          </div>

          {/* Main Content Area */}
          <div className="relative flex flex-1 flex-col overflow-hidden bg-black/20">
            <div className="flex-1 overflow-y-auto py-6" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {activeTab === "user" && (
                <div className="mx-auto max-w-lg space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="text-center">
                    <h3 className="text-base font-bold text-white">Public Profile</h3>
                    <p className="text-xs text-white/50">Manage how others see you on the platform</p>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="relative flex-shrink-0">
                      <div className="relative h-28 w-28 overflow-hidden rounded-2xl border-4 border-white/5 ring-violet-500/20">
                        <img
                          src={effectivePreview}
                          alt=""
                          className="h-full w-full object-cover"
                          onError={handleImageError}
                        />
                      </div>
                      <label className="absolute bottom-0 right-0 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-violet-600 ring-2 ring-black/20 transition-all duration-200 hover:bg-violet-500 hover:scale-110">
                        <Pencil className="h-3.5 w-3.5 text-white" />
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
                    </div>

                    <div className="flex-1 space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">Display Name</label>
                      <Input
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="Your display name"
                        className="h-9 border-white/5 bg-white/[0.03] text-sm text-white placeholder:text-white/10 focus:border-violet-500/40 focus:bg-white/[0.05]"
                      />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Message type="error">{error}</Message>
                    <Message type="success">{success}</Message>
                  </div>
                </div>
              )}

              {activeTab === "password" && (
                <div className="mx-auto max-w-lg space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div>
                    <h3 className="text-base font-bold text-white">Security</h3>
                    <p className="text-xs text-white/50">Update your password to keep your account secure</p>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-white/40">Current Password</label>
                      <Input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="••••••••"
                        className="h-11 border-white/10 bg-white/5 text-white placeholder:text-white/20 focus:border-violet-500/50"
                      />
                    </div>
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-white/40">New Password</label>
                        <Input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Min. 6 characters"
                          className="h-11 border-white/10 bg-white/5 text-white placeholder:text-white/20 focus:border-violet-500/50"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-white/40">Confirm New Password</label>
                        <Input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Confirm new password"
                          className="h-11 border-white/10 bg-white/5 text-white placeholder:text-white/20 focus:border-violet-500/50"
                        />
                      </div>
                    </div>
                  </div>
                  <Message type="error">{passwordError}</Message>
                  <Message type="success">{passwordSuccess}</Message>
                </div>
              )}

              {activeTab === "notifications" && (
                <div className="mx-auto max-w-lg space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div>
                    <h3 className="text-base font-bold text-white">Notifications</h3>
                    <p className="text-xs text-white/50">Configure how and when you want to be notified</p>
                  </div>

                  <div className="space-y-1 rounded-2xl border border-white/5 bg-white/[0.02]">
                    <NotificationToggle
                      label="Direct Messages"
                      description="Receive notifications for private messages"
                      icon={Image}
                      checked={notifDirectMessages}
                      onChange={setNotifDirectMessages}
                    />
                    <NotificationToggle
                      label="Friend Requests"
                      description="Notify when someone adds you"
                      icon={UserPlus}
                      checked={notifFriendRequests}
                      onChange={setNotifFriendRequests}
                    />
                    <NotificationToggle
                      label="Server Activity"
                      description="Notifications from joined servers"
                      icon={Users}
                      checked={notifServerMessages}
                      onChange={setNotifServerMessages}
                    />
                    <NotificationToggle
                      label="Server Invitations"
                      description="When you're invited to a new server"
                      icon={Mail}
                      checked={notifServerInvites}
                      onChange={setNotifServerInvites}
                    />
                  </div>
                  <Message type="success">{notifSuccess}</Message>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end border-t border-white/10 bg-white/[0.02] px-6 py-3">
              <div className="flex gap-3">
                {activeTab === "user" && (
                  <Button
                    onClick={saveProfile}
                    disabled={saving}
                    className="bg-violet-600 font-bold text-white hover:bg-violet-500"
                  >
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Save Profile
                  </Button>
                )}
                {activeTab === "password" && (
                  <Button
                    onClick={changePassword}
                    disabled={changingPassword}
                    className="bg-violet-600 font-bold text-white hover:bg-violet-500"
                  >
                    {changingPassword ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="mr-2 h-4 w-4" />}
                    Update Password
                  </Button>
                )}
                {activeTab === "notifications" && (
                  <Button
                    onClick={saveNotifications}
                    disabled={savingNotifications}
                    className="bg-violet-600 font-bold text-white hover:bg-violet-500"
                  >
                    {savingNotifications ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bell className="mr-2 h-4 w-4" />}
                    Save Preferences
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
