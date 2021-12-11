import { Entity, OneToOne, JoinColumn, Column} from 'typeorm';
import { User } from './user';
import { UserBaseEntity } from './UserBaseEntity';

@Entity()
export class UserDataUsingKMS extends UserBaseEntity {

    @Column({ type: 'bytea', nullable: false })
    phone: Buffer;

    @Column({ type: 'bytea', nullable: false })
    email: Buffer;

    @Column({ type: 'bytea', nullable: false })
    address: Buffer;

    @OneToOne(() => User, user => user.userDataUsingKMS)
    @JoinColumn()
    user: User;

    info(): IUserDataUsingKMS {
        const data: IUserDataUsingKMS = {
            username: this.user.username,
        };

        return data;
    };
};

interface IUserDataUsingKMS {
    username: string;
}
