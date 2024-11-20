import { supabase } from "../config/db.js";

const handleLogout = async (req, res) => {
  // On client, also delete the accessToken
  const cookies = req.cookies;
  if (!cookies?.jwt) return res.sendStatus(204); // No content
  const refreshToken = cookies.jwt;

  // Check if the refresh token exists in the database
  const { data: foundUser, error } = await supabase
    .from("admins")
    .select("id")
    .eq("refresh_token", refreshToken)
    .single();

  if (error || !foundUser) {
    // Clear the cookie and return 204 if no user is found
    res.clearCookie("jwt", { httpOnly: true, sameSite: "None", secure: true });
    return res.status(204).json({ message: "No user is found" });
  }

  // Delete the refresh token from the database
  await supabase
    .from("admins")
    .update({ refresh_token: "" }) // Set refresh_token to an empty string
    .eq("id", foundUser.id); // Use the id from foundUser

  // Clear the cookie
  res.clearCookie("jwt", { httpOnly: true, sameSite: "None", secure: true });
  res.status(204).json({ message: "Cookie cleared" });
};

export { handleLogout };
