import { Entity, OneToOne, JoinColumn, Column } from 'typeorm';
import { UserBaseEntity } from './UserBaseEntity';
import { User } from './user';

@Entity()
export class UserData extends UserBaseEntity {
    @Column({ type: 'bytea', nullable: false })
    phone: Buffer;

    @Column({ type: 'bytea', nullable: false })
    phoneKey: Buffer;

    @Column({ type: 'bytea', nullable: false })
    email: Buffer;

    @Column({ type: 'bytea', nullable: false })
    emailKey: Buffer;

    @Column({ type: 'bytea', nullable: false })
    address: Buffer;

    @Column({ type: 'bytea', nullable: false })
    addressKey: Buffer;
    
    @OneToOne(() => User, user => user.userData)
    @JoinColumn()
    user: User;

    info(): IUserData {
        const data: IUserData = {
            username: this.user.username,
        };

        return data;
    };
};

interface IUserData {
    username: string;
}