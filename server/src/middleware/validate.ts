import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

export function validate(schema: ZodSchema, source: 'body' | 'query' = 'body') {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(source === 'body' ? req.body : req.query);
    if (!result.success) {
      return res.status(400).json({
        error: '参数校验失败',
        details: result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`),
      });
    }
    if (source === 'body') {
      req.body = result.data;
    }
    next();
  };
}
