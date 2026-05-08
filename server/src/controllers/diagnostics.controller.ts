import { Response } from 'express';
import { spawn } from 'child_process';
import { AuthRequest } from '../middleware/auth';

export const streamTestLogs = (req: AuthRequest, res: Response) => {
  const type = req.query.type === 'e2e' ? 'test:e2e' : 'test:api';
  
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const child = spawn('npm', ['run', type], {
    cwd: process.cwd(),
    env: { ...process.env, NODE_ENV: 'test', FORCE_COLOR: '1' }
  });

  child.stdout.on('data', (data) => {
    const lines = data.toString().split('\n');
    lines.forEach((line: string) => {
      if (line.trim()) {
        res.write(`data: ${JSON.stringify({ type: 'stdout', message: line })}\n\n`);
      }
    });
  });

  child.stderr.on('data', (data) => {
    const lines = data.toString().split('\n');
    lines.forEach((line: string) => {
      if (line.trim()) {
        res.write(`data: ${JSON.stringify({ type: 'stderr', message: line })}\n\n`);
      }
    });
  });

  child.on('close', (code) => {
    res.write(`data: ${JSON.stringify({ type: 'exit', code })}\n\n`);
    res.end();
  });

  req.on('close', () => {
    child.kill();
  });
};
