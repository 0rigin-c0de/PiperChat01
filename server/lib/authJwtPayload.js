/**
 * JWT claims required by the frontend (jwt-decode on signin / profile update).
 */
export function buildAuthUserJwtPayload(user) {
  const id = user._id ?? user.id;
  return {
    id: id != null ? String(id) : "",
    email: user.email ?? "",
    username: user.username ?? "",
    tag: user.tag ?? "",
    profile_pic: user.profile_pic ?? "",
  };
}
