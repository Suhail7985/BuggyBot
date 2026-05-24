import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import mongoose from 'mongoose';

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

export const signAccessToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn as jwt.SignOptions['expiresIn'],
  });
};

export const signRefreshToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn as jwt.SignOptions['expiresIn'],
  });
};

export const verifyAccessToken = (token: string): TokenPayload => {
  return jwt.verify(token, config.jwt.secret) as TokenPayload;
};

export const verifyRefreshToken = (token: string): TokenPayload => {
  return jwt.verify(token, config.jwt.refreshSecret) as TokenPayload;
};

const isProd = process.env.NODE_ENV === 'production';
/** Cross-site cookies when frontend (Vercel) and API (Render/Railway) use different domains. */
const crossSite =
  isProd &&
  config.frontendUrl.startsWith('https://') &&
  !config.frontendUrl.includes('localhost');

export const cookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: (crossSite ? 'none' : 'lax') as 'lax' | 'none' | 'strict',
  path: '/',
};

export const accessTokenCookieOptions = {
  ...cookieOptions,
  maxAge: 15 * 60 * 1000, // 15 minutes
};

export const refreshTokenCookieOptions = {
  ...cookieOptions,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};
