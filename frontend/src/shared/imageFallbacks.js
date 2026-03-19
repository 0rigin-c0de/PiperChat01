export function getDefaultProfilePic() {
  return "https://imgs.search.brave.com/OrD16cB7BwEj3DZfFr7OHRQyABsYifutWhl975vIvII/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly93d3cu/cG5nYXJ0cy5jb20v/ZmlsZXMvMTAvRGVm/YXVsdC1Qcm9maWxl/LVBpY3R1cmUtUE5H/LUltYWdlLVRyYW5z/cGFyZW50LUJhY2tn/cm91bmQucG5n";
}

export function resolveProfilePic(profilePic, seed) {
  if (typeof profilePic === "string" && profilePic.trim().length > 0) {
    return profilePic;
  }

  return getDefaultProfilePic(seed);
}
