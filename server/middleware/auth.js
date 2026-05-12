import jwt from "jsonwebtoken";

export const authToken = async (req, res, next) => {
  try {
    const authHeader = req.headers["x-auth-token"];
    const decoded = jwt.verify(authHeader, process.env.ACCESS_TOKEN);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: "Unauthorized", status: 401 });
  }
};
