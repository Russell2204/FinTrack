import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

interface EnvConfig {
  port: number;
  nodeEnv: string;
  tursoUrl: string;
  tursoAuthToken: string | undefined;
  jwtSecret: string;
  jwtExpiresIn: string;
  bcryptRounds: number;
  corsOrigin: string;
}

const env: EnvConfig = {
  port: parseInt(process.env.PORT || '4000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  tursoUrl: process.env.TURSO_DATABASE_URL || 'file:local.db',
  tursoAuthToken: process.env.TURSO_AUTH_TOKEN || undefined,
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '10', 10),
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
};

if (env.nodeEnv === 'production') {
  if (env.jwtSecret === 'dev-secret-change-me') {
    throw new Error('JWT_SECRET must be set in production');
  }
}

export default env;
