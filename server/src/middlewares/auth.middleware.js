import db from "../config/db.config.js";
import { jwtService } from "../services/jwt.service.js";

export const protectedRoute = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(400)
        .json({ message: "Authorization header is missing or invalid" });
    }
    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(400).json({
        message: "Token is not available in the authorization header",
      });
    }

    const username = await jwtService.verifyJWT(token);

    const query = await db.query(
      "SELECT CASE WHEN EXISTS (SELECT 1 FROM users WHERE username = $1) THEN true ELSE false END AS is_valid",
      [username]
    );

    if (!query.rows[0].is_valid) {
      return res.status(400).json({ message: "No user found here" });
    }

    req.username = username;
    next();
  } catch (err) {
    return res.status(500).json({
      error:
        "Something is wrong with the is-valid middleware \n " + err.stack ||
        err,
    });
  }
};
