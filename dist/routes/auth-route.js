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
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const token_verify_js_1 = require("../helper/token-verify.js");
const auth_helper_js_1 = require("../helper/auth-helper.js");
const db_js_1 = __importDefault(require("../helper/db.js"));
const logger_js_1 = __importDefault(require("../helper/logger.js"));
const router = (0, express_1.Router)();
// Route to handle user login
router.post('/login', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = req.body;
    // Check if username and password are provided
    if (!username || !password) {
        logger_js_1.default.warn(`Login failed for user ${username}: Username and password are required.`);
        res.status(400).json({ error: 'Username and password are required' });
        return;
    }
    // Check if the username exists
    if (!(yield (0, auth_helper_js_1.doesUsernameExist)(username))) {
        logger_js_1.default.warn(`Login failed for user ${username}: Username does not exist.`);
        res.status(400).json({ error: 'Username does not exist' });
        return;
    }
    try {
        // Find the user in the database
        const user = yield db_js_1.default.user.findFirst({
            where: {
                username: username
            }
        });
        if (!user) {
            logger_js_1.default.warn(`Login failed for user ${username}: User does not exist.`);
            res.status(400).json({ error: 'User does not exist' });
            return;
        }
        // Check if the password is valid
        const isPasswordValid = yield bcryptjs_1.default.compare(password, user === null || user === void 0 ? void 0 : user.password);
        if (!isPasswordValid) {
            logger_js_1.default.warn(`Login failed for user ${username}: Invalid credentials.`);
            res.status(400).json({ error: 'Invalid credentials' });
            return;
        }
        // Create a JWT token
        const token = jsonwebtoken_1.default.sign({ userId: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '1h' });
        logger_js_1.default.info(`User ${username} logged in successfully.`);
        res.json({ message: 'Login successful', token });
    }
    catch (error) {
        next(error);
    }
}));
// Route to handle user registration
router.post('/register', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = req.body;
    // Check if username and password are provided
    if (!username || !password) {
        logger_js_1.default.warn(`Registration failed for user ${username}: Username and password are required.`);
        res.status(400).json({ error: 'Username and password are required' });
        return;
    }
    // Check if the username is already taken
    if (yield (0, auth_helper_js_1.doesUsernameExist)(username)) {
        logger_js_1.default.warn(`Registration failed for user ${username}: Username already taken.`);
        res.status(400).json({ error: 'Username already taken' });
        return;
    }
    try {
        // Hash the password
        const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
        // Create a new user in the database
        const newUser = yield db_js_1.default.user.create({
            data: {
                username: username,
                password: hashedPassword
            }
        });
        logger_js_1.default.info(`User ${username} registered successfully.`);
        res.json({ message: 'User created successfully', user: newUser });
    }
    catch (error) {
        return next(error);
    }
}));
// Route to get user information
router.get("/info", token_verify_js_1.authenticateToken, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        // Find the user in the database
        const user = yield db_js_1.default.user.findFirst({
            where: {
                id: (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId
            }
        });
        // Remove the password from the user object
        const { password } = user, otherUserData = __rest(user, ["password"]);
        logger_js_1.default.info(`User info accessed for user ${(_b = req.user) === null || _b === void 0 ? void 0 : _b.username}`);
        res.json(otherUserData);
    }
    catch (error) {
        next(error);
    }
}));
exports.default = router;
