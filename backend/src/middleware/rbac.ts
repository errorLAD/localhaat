import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.js';
import { UserRole } from '../models/User.js';

export const requireRoles = (allowedRoles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required prior to authorization.',
      });
    }

    if (req.user.role === 'admin') {
      // Admin has superuser access across endpoints
      return next();
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden. Role '${req.user.role}' is not authorized to access this resource. Required: ${allowedRoles.join(', ')}`,
      });
    }

    next();
  };
};
