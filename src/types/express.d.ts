// First, define the shape of your decoded JWT payload
interface JwtPayload {
  userId: string;
  username: string;
}

// Then, use declaration merging to add the 'user' property to the Request object
declare namespace Express {
  export interface Request {
    user?: JwtPayload; // Make it optional in case middleware is not used on all routes
  }
}