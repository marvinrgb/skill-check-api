import { Router, Request, Response, NextFunction} from 'express';
import { authenticateToken } from '../helper/token-verify.js';
import db from '../helper/db.js';

const router = Router();

// Route to create a new highscore
router.post('/', authenticateToken, async (req:Request, res:Response, next:NextFunction): Promise<void> => {
  const user = req.user;
  const { game_id, highscore_value } = req.body;

  // Check if game_id and highscore_value are provided
  if (!(user && game_id && highscore_value)) {
    res.status(400).send("game_id and highscore_value are required");
    return;
  }

  try {
    // Create a new highscore in the database
    await db.highscore.create({
      data: {
        game_id: game_id,
        user_id: user?.userId,
        value: highscore_value
      }
    })
    res.status(201).send();
  } catch (error) {
    next(error);
  }
});

// Route to get highscores for a game
router.get("/:game_id", async (req:Request, res:Response, next:NextFunction): Promise<void> => {
  // Check if game_id is provided
  if (!req.params.game_id) {
    res.status(400).send("game_id is required");
    return;
  }
  try {
    // Find all highscores for the game in the database
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
  } catch (error) {
    next(error);
  }
})

export default router;