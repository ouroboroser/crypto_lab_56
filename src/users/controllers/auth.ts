import { getRepository } from 'typeorm';
import { Context } from 'koa';
import { User } from '../entities/user';

export class Auth {
    static singUp = async (ctx: Context): Promise<void> => {
        const { username, password } = ctx.request.body;

        const checkUser = await getRepository(User)
        .createQueryBuilder('user')
        .where('user.username = :username', { username })
        .getOne();
        
        if (checkUser) {
            ctx.throw(400, 'User with the same name already exists');
        }

        const user = User.create({
            username,
        })

        user.password = user.generatePasswordHash(password);

        await user.save();

        ctx.status = 201;
        ctx.body = user.auth();
    };

    static singIn = async (ctx: Context): Promise<void> => {
        const { username, password } = ctx.request.body;

        const user = await getRepository(User)
        .createQueryBuilder('user')
        .where('user.username = :username', { username })
        .getOne();

        if (!user) {
            ctx.throw(404, 'User does not exist');
        };

        const checkPassword = user.checkPassword(password);

        if (!checkPassword) {
            ctx.throw(400, 'Incorrect password');
        };

        ctx.body = user.auth();
    };
}; 