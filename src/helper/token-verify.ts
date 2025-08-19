import jwt from 'jsonwebtoken';
import { Router, Request, Response, NextFunction} from 'express';
interface JwtPayload {
  userId: string;
  username: string;
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  // Get the token from the Authorization header, which is typically in the format: "Bearer TOKEN"
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) {
    // If no token is provided, deny access
    res.sendStatus(401); // Unauthorized
    return 
  }

  // Verify the token using the secret key
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      // If the token is invalid (e.g., expired or tampered with), deny access
      console.error(err);
      res.sendStatus(403); // Forbidden
      return 
    }

    // If the token is valid, the payload (user info) is attached to the request object
    req.user = user as JwtPayload;
    next(); // Proceed to the next middleware or the route handler
  });
};