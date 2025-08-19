import { Router, Request, Response, NextFunction} from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken"
import { authenticateToken } from '../helper/token-verify';
const router = Router();

router.post('/login', async (req:Request, res:Response, next:NextFunction): Promise<void> => {
  const { username, password } = req.body;
  const db = new PrismaClient();

  if (!username || !password) {
    res.status(400).json({ error: 'Username and password are required' });
    return;
  }
  if (!(await doesUsernameExist(username))) {
    res.status(400).json({ error: 'Username does not exist' });
    return;
  }  

  try {
    const user = await db.user.findFirst({
      where: {
        username: username
      }
    });
    if (!user) {
      res.status(400).json({ error: 'User does not exist' });
      return;
    }  

    const isPasswordValid = await bcrypt.compare(password, user?.password)
    if (!isPasswordValid) {
      res.status(400).json({ error: 'Invalid credentials' });
      return;
    }  

    const token = jwt.sign({ userId: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ message: 'Login successful', token });


  } catch (error) {
    
  }
});

router.post('/register', async (req:Request, res:Response, next:NextFunction): Promise<void> => {
  const { username, password } = req.body;
  const db = new PrismaClient();

  if (!username || !password) {
    res.status(400).json({ error: 'Username and password are required' });
    return;
  }
  if (await doesUsernameExist(username)) {
    res.status(400).json({ error: 'Username already taken' });
    return;
  }  

  try {
    
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await db.user.create({
      data: {
        username: username,
        password: hashedPassword
      }
    });
    
    res.json({ message: 'User created successfully', user: newUser });
  } catch (error: unknown) {
    return next(error);
  }
});

router.get("/info", authenticateToken, async (req:Request, res:Response, next:NextFunction): Promise<void> => {
  try {
    const db = new PrismaClient();
    const user = await db.user.findFirst({
      where: {
        id: req.user?.userId
      }
    });
    const {password, ...otherUserData} = user;
    res.json(otherUserData);
  } catch (error) {
    console.error(error)
  }
});

async function doesUsernameExist(username: string): Promise<boolean> {
  const db = new PrismaClient();
  const result = await db.user.findFirst({
    where: {
      username: username
    }
  });
  return result != undefined;
};


export default router;