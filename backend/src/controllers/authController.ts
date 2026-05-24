import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { User } from '../models/User';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  accessTokenCookieOptions,
  refreshTokenCookieOptions,
  TokenPayload,
} from '../utils/jwt';
import { z } from 'zod';

const registerSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email(),
  password: z.string().min(6).max(100),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const setAuthCookies = (res: Response, userId: string, email: string, role: string) => {
  const payload: TokenPayload = { userId, email, role };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  res.cookie('access_token', accessToken, accessTokenCookieOptions);
  res.cookie('refresh_token', refreshToken, refreshTokenCookieOptions);

  return { accessToken, refreshToken };
};

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, message: 'Validation failed', errors: parsed.error.issues });
      return;
    }

    const { name, email, password } = parsed.data;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(409).json({ success: false, message: 'Email already registered' });
      return;
    }

    const user = await User.create({ name, email, password });

    setAuthCookies(res, user._id.toString(), user.email, user.role);

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, message: 'Validation failed', errors: parsed.error.issues });
      return;
    }

    const { email, password } = parsed.data;

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
      return;
    }

    setAuthCookies(res, user._id.toString(), user.email, user.role);

    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  res.clearCookie('access_token');
  res.clearCookie('refresh_token');
  res.json({ success: true, message: 'Logged out successfully' });
};

export const refresh = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const refreshToken = req.cookies?.refresh_token;
    if (!refreshToken) {
      res.status(401).json({ success: false, message: 'No refresh token provided' });
      return;
    }

    const decoded = verifyRefreshToken(refreshToken);
    const user = await User.findById(decoded.userId);

    if (!user) {
      res.status(401).json({ success: false, message: 'User not found' });
      return;
    }

    setAuthCookies(res, user._id.toString(), user.email, user.role);

    res.json({
      success: true,
      message: 'Token refreshed',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid or expired refresh token' });
  }
};

const updateProfileSchema = z.object({
  name: z.string().min(2).max(50),
});

export const updateProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const parsed = updateProfileSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, message: 'Validation failed', errors: parsed.error.issues });
      return;
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      { name: parsed.data.name },
      { new: true }
    );

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    res.json({
      success: true,
      message: 'Profile updated',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await User.findById((req as any).userId);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }
    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};
