import jwt from "jsonwebtoken";

export const authToken = async (req, res, next) => {
  try {
    const authHeader = req.headers["x-auth-token"];
    jwt.verify(authHeader, process.env.ACCESS_TOKEN);
    next();
  } catch (err) {
    res.status(400).json({ message: "not right", status: 400 });
  }
};
