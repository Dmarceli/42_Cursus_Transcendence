import { User } from 'src/db_interactions_modules/users/user.entity';
import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    ManyToMany,
    JoinTable
   } from 'typeorm';
    
   @Entity()
   export class Channel {
    @PrimaryGeneratedColumn()
    id: number;
    
    @Column()
    type: number;
    
    @Column({nullable: true})
    channel_name: string;

    @Column({nullable: true, select: false})
    password: string;

    @CreateDateColumn()
    last_message_on_channel: Date;
    
    // @ManyToMany(() => User)
    // @JoinTable()
    // admins: User[];

    // @ManyToMany(() => User)
    // @JoinTable()
    // users_joined: User[];
   }



