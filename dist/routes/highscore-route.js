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
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const token_verify_1 = require("../helper/token-verify");
const router = (0, express_1.Router)();
router.post('/', token_verify_1.authenticateToken, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const { game_id, highscore_value } = req.body;
    if (!(user && game_id && highscore_value)) {
        res.status(400).send("game_id and highscore_value are required");
        return;
    }
    const db = new client_1.PrismaClient();
    try {
        yield db.highscore.create({
            data: {
                game_id: game_id,
                user_id: user === null || user === void 0 ? void 0 : user.userId,
                value: highscore_value
            }
        });
    }
    catch (error) {
    }
}));
router.get("/:game_id", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.params.game_id) {
        res.status(400).send("game_id and highscore_value are required");
        return;
    }
    const db = new client_1.PrismaClient();
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
    res.json(highscores);
}));
exports.default = router;
