import { getRepository } from 'typeorm';
import { Context } from 'koa';
import { User } from '../entities/user';
import { UserData } from '../entities/userData';
import { DataProtection } from '../../helpers/dataProtection';
import { UserDataUsingKMS } from '../entities/userDataUsingKMS';

export class Data {
    static addUserData = async (ctx: Context): Promise<void> => {
        const id = ctx.state.user.id;

        const { phone, address, email } = ctx.request.body;

        const ProtectData = new DataProtection();

        const encryptPhone = ProtectData.encrypt(phone);
        const encryptAddress = ProtectData.encrypt(address);
        const encryptEmail = ProtectData.encrypt(email);

        const user = await getRepository(User)
        .createQueryBuilder('user')
        .where('user.id = :id', { id })
        .getOne();

        if (!user) {
            ctx.throw(404, 'Not found');
        };

        const data = await UserData.create({
            phone: encryptPhone.encrypt,
            phoneKey: encryptPhone.propertyKey,
            address: encryptAddress.encrypt,
            addressKey: encryptAddress.propertyKey,
            email: encryptEmail.encrypt,
            emailKey: encryptEmail.propertyKey,
            user,
        }).save();

        const encryptPhoneUsingKMS = await ProtectData.kmsEncrypt(phone);
        const encryptAddressUsingKMS = await ProtectData.kmsEncrypt(address);
        const encryptEmailUsingKMS = await ProtectData.kmsEncrypt(email);

        const dataUsingKMS = await UserDataUsingKMS.create({
            phone: encryptPhoneUsingKMS,
            email: encryptEmailUsingKMS,
            address: encryptAddressUsingKMS,
            user,
        }).save();

        ctx.status = 201;

        ctx.body = {
            data: data.info(),
            dataKMS: dataUsingKMS.info()
        }
    };

    static retrieveUserData = async (ctx: Context):Promise<void> => {
        const id = ctx.state.user.id;

        const userData = await getRepository(UserData)
        .createQueryBuilder('userData')
        .where('userData.userId = :id', { id })
        .getOne();

        if (!userData) {
            ctx.throw(404, 'Not found');
        };

        const ProtectData = new DataProtection();

        const phone = ProtectData.decrypt(userData.phone, userData.phoneKey);
        const address = ProtectData.decrypt(userData.address, userData.addressKey);
        const email = ProtectData.decrypt(userData.email, userData.emailKey);

        ctx.body = {
            phone: phone,
            address: address,
            email: email
        }
    };

    static retrieveListOfUserData = async (ctx: Context): Promise<void> => {
        const users = await getRepository(UserData)
        .createQueryBuilder('userData')
        .leftJoinAndSelect('userData.user', 'user')
        .getMany();

        const usersUsingKMS = await getRepository(UserDataUsingKMS)
        .createQueryBuilder('userDataUsingKMS')
        .leftJoinAndSelect('userDataUsingKMS.user', 'userDataUsingKMS.user')
        .getMany();

        const ProtectData = new DataProtection();

        const data = users.map(user => {
            return {
                id: user.id,
                username: user.user.username,
                phone: ProtectData.decrypt(user.phone, user.phoneKey),
                address: ProtectData.decrypt(user.address, user.addressKey),
                email: ProtectData.decrypt(user.email, user.emailKey),
            };
        });

        const dataFromKMS = await Promise.all(usersUsingKMS.map(async (user) => {
            return {
                id: user.id,
                username: user.user.username,
                phone: await ProtectData.kmsDecrypt(user.phone),
                address: await ProtectData.kmsDecrypt(user.address),
                email: await ProtectData.kmsDecrypt(user.email),
            };
        }))

        ctx.body = {
            data,
            dataFromKMS
        }
    };
}; 