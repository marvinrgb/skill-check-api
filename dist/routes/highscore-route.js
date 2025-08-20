"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const token_verify_js_1 = require("../helper/token-verify.js");
const db_js_1 = __importDefault(require("../helper/db.js"));
const logger_js_1 = __importDefault(require("../helper/logger.js"));
const router = (0, express_1.Router)();
// Route to create a new highscore
router.post('/', token_verify_js_1.authenticateToken, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const { game_id, highscore_value } = req.body;
    // Check if game_id and highscore_value are provided
    if (!(user && game_id && highscore_value)) {
        logger_js_1.default.warn(`Highscore creation failed: game_id and highscore_value are required.`);
        res.status(400).send("game_id and highscore_value are required");
        return;
    }
    try {
        // Create a new highscore in the database
        yield db_js_1.default.highscore.create({
            data: {
                game_id: game_id,
                user_id: user === null || user === void 0 ? void 0 : user.userId,
                value: highscore_value
            }
        });
        logger_js_1.default.info(`Highscore created for game ${game_id} by user ${user === null || user === void 0 ? void 0 : user.username}.`);
        res.status(201).send();
    }
    catch (error) {
        next(error);
    }
}));
// Route to get highscores for a game
router.get("/:game_id", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { game_id } = req.params;
    // Check if game_id is provided
    if (!game_id) {
        logger_js_1.default.warn(`Highscore retrieval failed: game_id is required.`);
        res.status(400).send("game_id is required");
        return;
    }
    try {
        // Find all highscores for the game in the database
        const highscores = yield db_js_1.default.highscore.findMany({
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
        logger_js_1.default.info(`Highscores retrieved for game ${game_id}.`);
        res.json(highscores);
    }
    catch (error) {
        next(error);
    }
}));
exports.default = router;
