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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const token_verify_1 = require("../helper/token-verify");
const router = (0, express_1.Router)();
router.post('/login', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = req.body;
    const db = new client_1.PrismaClient();
    if (!username || !password) {
        res.status(400).json({ error: 'Username and password are required' });
        return;
    }
    if (!(yield doesUsernameExist(username))) {
        res.status(400).json({ error: 'Username does not exist' });
        return;
    }
    try {
        const user = yield db.user.findFirst({
            where: {
                username: username
            }
        });
        if (!user) {
            res.status(400).json({ error: 'User does not exist' });
            return;
        }
        const isPasswordValid = yield bcryptjs_1.default.compare(password, user === null || user === void 0 ? void 0 : user.password);
        if (!isPasswordValid) {
            res.status(400).json({ error: 'Invalid credentials' });
            return;
        }
        const token = jsonwebtoken_1.default.sign({ userId: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ message: 'Login successful', token });
    }
    catch (error) {
    }
}));
router.post('/register', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = req.body;
    const db = new client_1.PrismaClient();
    if (!username || !password) {
        res.status(400).json({ error: 'Username and password are required' });
        return;
    }
    if (yield doesUsernameExist(username)) {
        res.status(400).json({ error: 'Username already taken' });
        return;
    }
    try {
        const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
        const newUser = yield db.user.create({
            data: {
                username: username,
                password: hashedPassword
            }
        });
        res.json({ message: 'User created successfully', user: newUser });
    }
    catch (error) {
        return next(error);
    }
}));
router.get("/info", token_verify_1.authenticateToken, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const db = new client_1.PrismaClient();
        const user = yield db.user.findFirst({
            where: {
                id: (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId
            }
        });
        const { password } = user, otherUserData = __rest(user, ["password"]);
        res.json(otherUserData);
    }
    catch (error) {
        console.error(error);
    }
}));
function doesUsernameExist(username) {
    return __awaiter(this, void 0, void 0, function* () {
        const db = new client_1.PrismaClient();
        const result = yield db.user.findFirst({
            where: {
                username: username
            }
        });
        return result != undefined;
    });
}
;
exports.default = router;
