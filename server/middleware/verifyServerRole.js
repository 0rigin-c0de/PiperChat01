import jwt from "jsonwebtoken";
import { checkServerInUser } from "../services/serverService.js";
//checking jwt
export const verifyServerRole = async (req, res, next) => {
  let decoded;
  try {
    const token = req.headers["x-auth-token"];
    if (!token) {
      return res
        .status(401)
        .json({ status: 401, message: "Authentication required" });
    }
    decoded = jwt.verify(token, process.env.ACCESS_TOKEN);
  } catch (err) {
    return res
      .status(401)
      .json({ status: 401, message: "Invalid or expired token" });
  }
  //checking server membership
  const { server_id } = req.body;
  let membership;
  try {
    const result = await checkServerInUser(decoded.id, server_id);
    membership = result?.[0].servers?.[0];
  } catch (err) {
    return res
      .status(500)
      .json({ status: 500, message: "server error during membership check" });
  }
  //check role
  if (!["owner", "admin"].includes(membership.server_role)) {
    return res.status(403).json({
      status: 403,
      message: "You don't have permission to perform this action",
    });
  }
  //if all pass then we come here.
  req.user = decoded;
  req.serverMembership = membership;
  next();
};
