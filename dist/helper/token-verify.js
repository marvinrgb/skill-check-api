"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authenticateToken = (req, res, next) => {
    // Get the token from the Authorization header, which is typically in the format: "Bearer TOKEN"
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) {
        // If no token is provided, deny access
        res.sendStatus(401); // Unauthorized
        return;
    }
    // Verify the token using the secret key
    jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            // If the token is invalid (e.g., expired or tampered with), deny access
            console.error(err);
            res.sendStatus(403); // Forbidden
            return;
        }
        // If the token is valid, the payload (user info) is attached to the request object
        req.user = user;
        next(); // Proceed to the next middleware or the route handler
    });
};
exports.authenticateToken = authenticateToken;
