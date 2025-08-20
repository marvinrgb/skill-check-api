import { Router, Request, Response, NextFunction} from 'express';
import { authenticateToken } from '../helper/token-verify.js';
import db from '../helper/db.js';
import logger from '../helper/logger.js';

const router = Router();

// Route to create a new highscore
router.post('/', authenticateToken, async (req:Request, res:Response, next:NextFunction): Promise<void> => {
  const user = req.user;
  const { game_id, highscore_value } = req.body;

  // Check if game_id and highscore_value are provided
  if (!(user && game_id && highscore_value)) {
    logger.warn(`Highscore creation failed: game_id and highscore_value are required.`);
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
    logger.info(`Highscore created for game ${game_id} by user ${user?.username}.`);
    res.status(201).send();
  } catch (error) {
    next(error);
  }
});

// Route to get highscores for a game
router.get("/:game_id", async (req:Request, res:Response, next:NextFunction): Promise<void> => {
  const { game_id } = req.params;
  // Check if game_id is provided
  if (!game_id) {
    logger.warn(`Highscore retrieval failed: game_id is required.`);
    res.status(400).send("game_id is required");
    return;
  }
  try {
    // Find all highscores for the game in the database
    const highscores = db.highscore.findMany({
      where: {
        game_id: game_id
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
    logger.info(`Highscores retrieved for game ${game_id}.`);
    res.json(highscores)
  } catch (error) {
    next(error);
  }
})

export default router;