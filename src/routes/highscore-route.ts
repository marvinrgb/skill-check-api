import { Router, Request, Response, NextFunction} from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken"
import { authenticateToken } from '../helper/token-verify';
const router = Router();

router.post('/', authenticateToken, async (req:Request, res:Response, next:NextFunction): Promise<void> => {
  const user = req.user;
  const { game_id, highscore_value } = req.body;

  if (!(user && game_id && highscore_value)) {
    res.status(400).send("game_id and highscore_value are required");
    return;
  }


  const db = new PrismaClient();
  try {
    await db.highscore.create({
      data: {
        game_id: game_id,
        user_id: user?.userId,
        value: highscore_value
      }
    })
  } catch (error) {
    
  }
});

router.get("/:game_id", async (req:Request, res:Response, next:NextFunction): Promise<void> => {
  if (!req.params.game_id) {
    res.status(400).send("game_id and highscore_value are required");
    return;
  }
  const db = new PrismaClient();
  const highscores = db.highscore.findMany({
    where: {
      game_id: req.params.game_id
    },
    orderBy: {
      value: 'desc'
    },
    select: {
      created_at: true,
      value: true,
      user: {
        select: {
          username: true
        }
      }
    }
  });
  res.json(highscores)
})

export default router;