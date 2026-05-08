import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT || 3001,
  jwtSecret: process.env.JWT_SECRET || 'super-secret-key-change-me',
  nodeEnv: process.env.NODE_ENV || 'development',
};
