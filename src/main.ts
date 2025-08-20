import express, { Application, json as parseRequestJSON, urlencoded as parseURLQuery, Request, Response, NextFunction } from 'express';
import RouteManager from './routes/router-manager.js';
import logger from './helper/logger.js';

// if there a env set use it as port, if not use 3000
const port: number = process.env.API_PORT ? Number(process.env.API_PORT) : 3000;

const app: Application = express();

// remove express header
app.disable('x-powered-by');

// parse requestbody if in json (= make it usable)
app.use(parseRequestJSON());

// the same but for the query parameters
app.use(parseURLQuery());

app.use((req,res,next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', '*');
  next();
})

// Middleware to log requests
app.use((req: Request, res: Response, next: NextFunction) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// forwards all requests under /api to the routeManager, wich distributes them further
app.use('/api', RouteManager);

// Global error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error(err.stack);
  res.status(500).send('Something broke!');
});


// starts the server under the specified port
app.listen(port, () => {
  logger.info(`api running on port ${port}`);
});