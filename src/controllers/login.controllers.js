import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import { supabase } from "../config/db.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: __dirname + "../env/.env" });

const handleLogin = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  const { data: adminData, error } = await supabase
    .from("admins")
    .select("*")
    .eq("email", email)
    .single();

  if (error || !adminData) {
    return res.sendStatus(401); // Unauthorized
  }

  // Compare provided password with the stored password hash
  const match = await bcrypt.compare(password, adminData.password);
  if (match) {
    // Generate Access and Refresh Tokens with sub and exp claims
    const accessToken = jwt.sign(
      { sub: adminData.id, exp: Math.floor(Date.now() / 1000) + (1*60*60) }, // 30 seconds expiration
      process.env.ACCESS_TOKEN_SECRET
    );

    const refreshToken = jwt.sign(
      { sub: adminData.id,exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) }, // 1 day expiration
      process.env.REFRESH_TOKEN_SECRET
    );

    // Update the refresh token in the 'admins' table
    const { error: updateError } = await supabase
      .from("admins")
      .update({ refresh_token: refreshToken })
      .eq("id", adminData.id);

    if (updateError) {
      return res.status(500).json({ message: "Failed to update refresh token" });
    }

    
    res.cookie("jwt", refreshToken, {
      httpOnly: true,
      sameSite: "None",
      secure: true,
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });
    console.log('Cookie set:', accessToken);
  
    res.json({ accessToken });
  } else {
    res.status(401).json("Lah yser")/ Unauthorized
  }
};

export { handleLogin };
