import { Router, Request, Response, NextFunction} from 'express';
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken"
import { authenticateToken } from '../helper/token-verify.js';
import { doesUsernameExist } from '../helper/auth-helper.js';
import db from '../helper/db.js';
import logger from '../helper/logger.js';

const router = Router();

// Route to handle user login
router.post('/login', async (req:Request, res:Response, next:NextFunction): Promise<void> => {
  const { username, password } = req.body;

  // Check if username and password are provided
  if (!username || !password) {
    logger.warn(`Login failed for user ${username}: Username and password are required.`);
    res.status(400).json({ error: 'Username and password are required' });
    return;
  }
  // Check if the username exists
  if (!(await doesUsernameExist(username))) {
    logger.warn(`Login failed for user ${username}: Username does not exist.`);
    res.status(400).json({ error: 'Username does not exist' });
    return;
  }  

  try {
    // Find the user in the database
    const user = await db.user.findFirst({
      where: {
        username: username
      }
    });
    if (!user) {
      logger.warn(`Login failed for user ${username}: User does not exist.`);
      res.status(400).json({ error: 'User does not exist' });
      return;
    }  

    // Check if the password is valid
    const isPasswordValid = await bcrypt.compare(password, user?.password)
    if (!isPasswordValid) {
      logger.warn(`Login failed for user ${username}: Invalid credentials.`);
      res.status(400).json({ error: 'Invalid credentials' });
      return;
    }  

    // Create a JWT token
    const token = jwt.sign({ userId: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '1h' });

    logger.info(`User ${username} logged in successfully.`);
    res.json({ message: 'Login successful', token });


  } catch (error) {
    next(error);
  }
});

// Route to handle user registration
router.post('/register', async (req:Request, res:Response, next:NextFunction): Promise<void> => {
  const { username, password } = req.body;

  // Check if username and password are provided
  if (!username || !password) {
    logger.warn(`Registration failed for user ${username}: Username and password are required.`);
    res.status(400).json({ error: 'Username and password are required' });
    return;
  }
  // Check if the username is already taken
  if (await doesUsernameExist(username)) {
    logger.warn(`Registration failed for user ${username}: Username already taken.`);
    res.status(400).json({ error: 'Username already taken' });
    return;
  }  

  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user in the database
    const newUser = await db.user.create({
      data: {
        username: username,
        password: hashedPassword
      }
    });
    
    logger.info(`User ${username} registered successfully.`);
    res.json({ message: 'User created successfully', user: newUser });
  } catch (error: unknown) {
    return next(error);
  }
});

// Route to get user information
router.get("/info", authenticateToken, async (req:Request, res:Response, next:NextFunction): Promise<void> => {
  try {
    // Find the user in the database
    const user = await db.user.findFirst({
      where: {
        id: req.user?.userId
      }
    });
    // Remove the password from the user object
    const {password, ...otherUserData} = user;
    logger.info(`User info accessed for user ${req.user?.username}`);
    res.json(otherUserData);
  } catch (error) {
    next(error);
  }
});

export default router;