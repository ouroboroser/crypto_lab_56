import { Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Column, BaseEntity, OneToOne } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { UserData } from './userData';
import { UserDataUsingKMS } from './userDataUsingKMS';
import { config } from '../../../config';

@Entity()
export class User extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @CreateDateColumn()
    createdAt: string;

    @UpdateDateColumn()
    updatedAt: string;

    @Column()
    username: string;

    @Column()
    password: string;

    generatePasswordHash(password: string) {
        return bcrypt.hashSync(password, 10);
    };

    checkPassword(password: string) {
        return bcrypt.compareSync(password, this.password);
    }

    auth() {
        const payload = {
            id: this.id,
            username: this.username,
        };
        
        const access: string = config.jwt.key;
        const expired: number = config.jwt.expiresIn;
    
        return {
            token: jwt.sign(payload, access, { expiresIn: expired }),
            user: {
                id: this.id,
                username: this.username
            },
        };
      }

    @OneToOne(() => UserData, userData => userData.user)
    userData: UserData;

    @OneToOne(() => UserDataUsingKMS, userDataUsingKMS => userDataUsingKMS.user)
    userDataUsingKMS: UserDataUsingKMS;
}