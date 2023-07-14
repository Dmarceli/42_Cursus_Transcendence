import { User } from 'src/db_interactions_modules/users/user.entity';
import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    OneToOne,
    JoinColumn
   } from 'typeorm';
    
   @Entity()
   export class Events {
    @PrimaryGeneratedColumn()
    id: number;
    
    @OneToOne(() => User)
    @JoinColumn()
    requester_user: User;
   
    @OneToOne(() => User)
    @JoinColumn()
    decider_user: User;

    @Column()
    time: Date;
    
    @Column()
    type: number;

    @Column()
    message: string;

    @Column()
    already_seen: boolean;
   }

