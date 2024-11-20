  import jwt from "jsonwebtoken";
  import dotenv from "dotenv";

  dotenv.config();

  const verifyJWT = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    if (!authHeader) return res.status(401).json({ error: "Unauthorized: No authorization header" }); // Unauthorized
    console.log(authHeader)
    const token = authHeader.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Unauthorized: No token provided" }); // Unauthorized

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
      if (err) return res.status(403).json({ error: "Forbidden: Invalid token" }); // Forbidden

      req.id = decoded.sub; // Assuming 'sub' is the user ID in the token
      next(); // Proceed to the next middleware or route handler
    });
  };

  export default verifyJWT; // Use ES6 export syntax
