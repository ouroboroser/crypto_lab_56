import 'reflect-metadata';
import * as Koa from 'koa';
import * as Router from 'koa-router';
import * as body from 'koa-body';
import * as cors from '@koa/cors';

import { createConnection } from 'typeorm';

import userRouter from './users/router';
import { config } from '../config';

const app = new Koa();
const router = new Router();

createConnection(config.database)
.then( async() => {
    router.get('/', async(ctx, next) => {
        ctx.body = 'OK';    
        await next();
    });
    
    app.use(body());
    app.use(cors());
    
    app.use(userRouter.routes());
    
    app.use(router.routes());
    app.use(router.allowedMethods());
    
    app.listen(config.port, () => {
        console.log(`Server has been started on ${config.port} port`);
    });
}).catch(e => console.log(e));
