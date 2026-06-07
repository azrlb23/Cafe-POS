import { Request, Response, NextFunction } from 'express';

export const hasRole = (roles: string | string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.session || !req.session.role) {
      res.status(401).json({ message: 'Unauthorized.' });
      return;
    }
    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    if (allowedRoles.includes(req.session.role)) {
      next();
      return;
    }
    res.status(403).json({ message: 'Forbidden. You do not have permission.' });
  };
};
