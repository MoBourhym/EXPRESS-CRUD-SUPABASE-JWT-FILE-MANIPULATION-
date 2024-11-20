import jwt from "jsonwebtoken";

const verifyLogin = (req, res) => {
  // Access the JWT from the cookie
  const token = req.cookies.jwt;

  
  // Check if the token exists
  if (!token) {
    console.log("No token found. User is not logged in.");
    return res.status(401).json({ message: "Unauthorized: No token provided." });
  }

  // Verify the token
  jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      console.error("Token Expired error:", err); // Log the error for debugging
      return res.status(401).json({ message: "Unauthorized: Invalid token." });
    }

    // Token is valid
    console.log("Decoded token:", decoded); // Log the decoded token if needed
    res.json({ loggedIn: true }); // Optionally return user info from the decoded token
  });
};

export default verifyLogin;
