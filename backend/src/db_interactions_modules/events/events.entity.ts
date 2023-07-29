import { User } from 'src/db_interactions_modules/users/user.entity';
import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    ManyToOne,
    JoinColumn
   } from 'typeorm';
    
   @Entity()
   export class Events {
    @PrimaryGeneratedColumn()
    id: number;
    
    @ManyToOne(() => User, user => user.id)
    @JoinColumn({ name: 'requester_user' })
    requester_user: User;
   
    @ManyToOne(() => User, user => user.id)
    @JoinColumn({ name: 'decider_user' })
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

