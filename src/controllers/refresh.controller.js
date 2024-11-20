import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { supabase } from "../config/db.js"; // Make sure to import supabase
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: __dirname + "../env/.env" });

const handleRefreshToken = async (req, res) => {

  const cookies = req.cookies;
 
  if (!cookies?.jwt)
    return res
      .status(401)
      .json({ error: "Unauthorized: No authorization header" }); // Unauthorized
  const refreshToken = cookies.jwt;

  // Check if the refresh token exists in the database
  const { data: foundUser, error } = await supabase
    .from("admins")
    .select("id, refresh_token") // Also select refresh_token to check later
    .eq("refresh_token", refreshToken)
    .single();

  if (error || !foundUser)
    return res.status(403).json({ error: "Unauthorized: Forbidden access" }); // Forbidden

  // Verify the refresh token
  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
    if (err || foundUser.refresh_token !== refreshToken)
      res.status(403).json({ error: "Unauthorized: Forbidden access" }); // Forbidden

    // Create a new access token
    const accessToken = jwt.sign(
      { sub: foundUser.id, exp: Math.floor(Date.now() / 1000) + (1*60*60) }, // Set subject to user id
      process.env.ACCESS_TOKEN_SECRET,
    
    );

    res.json({ accessToken });
  });
};

export { handleRefreshToken }; // Correct export statement
