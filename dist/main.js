"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importStar(require("express"));
const router_manager_js_1 = __importDefault(require("./routes/router-manager.js"));
const logger_js_1 = __importDefault(require("./helper/logger.js"));
// if there a env set use it as port, if not use 3000
const port = process.env.API_PORT ? Number(process.env.API_PORT) : 3000;
const app = (0, express_1.default)();
// remove express header
app.disable('x-powered-by');
// parse requestbody if in json (= make it usable)
app.use((0, express_1.json)());
// the same but for the query parameters
app.use((0, express_1.urlencoded)());
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', '*');
    next();
});
// Middleware to log requests
app.use((req, res, next) => {
    console.log(req.body);
    logger_js_1.default.info(`${req.method} ${req.url}`);
    next();
});
// forwards all requests under /api to the routeManager, wich distributes them further
app.use('/api', router_manager_js_1.default);
// Global error handler
app.use((err, req, res, next) => {
    logger_js_1.default.error(err.stack);
    res.status(500).send('Something broke!');
});
// starts the server under the specified port
app.listen(port, () => {
    logger_js_1.default.info(`api running on port ${port}`);
});
