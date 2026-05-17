import defaultProfilePic from "../images/default_profile_avatar.svg";

export function getDefaultProfilePic() {
  return defaultProfilePic;
}

export function getDicebearProfilePic(seed) {
  const safeSeed = typeof seed === "string" ? seed.trim() : "";
  const normalizedSeed = safeSeed.length > 0 ? safeSeed : "default";
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(normalizedSeed)}`;
}

export function resolveProfilePic(profilePic, seed) {
  if (typeof profilePic === "string" && profilePic.trim().length > 0) {
    return profilePic;
  }

  if (typeof seed === "string" && seed.trim().length > 0) {
    return getDicebearProfilePic(seed);
  }

  return getDefaultProfilePic();
}
