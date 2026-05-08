import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  const errorMessage = err.message || 'Internal Server Error';

  // Logowanie błędów 500 do pliku
  if (statusCode === 500) {
    const logEntry = `[${new Date().toISOString()}] ${req.method} ${req.url} - ${errorMessage}\n${err.stack}\n\n`;
    const logPath = path.join(process.cwd(), 'logs', 'error.log');
    fs.appendFile(logPath, logEntry, (fsErr) => {
      if (fsErr) console.error('Failed to write to error log:', fsErr);
    });
  }

  console.error(err.stack);

  res.status(statusCode).json({
    error: errorMessage,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};
