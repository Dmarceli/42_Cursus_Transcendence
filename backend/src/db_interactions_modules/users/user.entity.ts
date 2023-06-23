import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    OneToMany,
   } from 'typeorm';

import { friend } from 'src/db_interactions_modules/relations/friend/friend.entity';
@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;
    
    @Column({unique: true})
    nick: string;
    
    @Column()
    intra_nick: string;

    @Column()
    avatar: string;
    
    @Column()
    lost_games: number;
      
    @Column()
    won_games: number;

    @Column()
    xp_total: number;
    
    @CreateDateColumn()
    creation_date: Date;

    @CreateDateColumn()
    last_joined_date: Date;

}
