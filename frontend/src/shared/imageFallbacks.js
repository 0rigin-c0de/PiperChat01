import defaultProfilePic from "../images/default_profile_avatar.svg";

export function getDefaultProfilePic() {
  return defaultProfilePic;
}

export function resolveProfilePic(profilePic, seed) {
  if (typeof profilePic === "string" && profilePic.trim().length > 0) {
    return profilePic;
  }

  return getDefaultProfilePic(seed);
}
