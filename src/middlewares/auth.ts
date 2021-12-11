import { Context } from 'koa';
import { config } from '../../config';
import * as jwt from 'jsonwebtoken';

export const authenticate = async (ctx: Context, next: () => Promise<any>) => {
  const header = ctx.headers.authorization;

  if (header) {
    const token = header.split(' ')[1];

    try {
      const user = jwt.verify(token, config.jwt.key);
      if (user) {
        ctx.state.user = user;
        await next();
      } else {
        ctx.status = 401;
        ctx.throw(401);
      }
    } 
    
    catch (err: any) {
      ctx.throw(err.statusCode, err.message);
    }
  } else {
    ctx.throw(401);
  }
};