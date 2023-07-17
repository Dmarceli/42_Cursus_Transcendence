import { User } from 'src/db_interactions_modules/users/user.entity';
import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    OneToOne,
    JoinColumn,
    ManyToOne
   } from 'typeorm';
    
   @Entity()
   export class GameHistory {
    @PrimaryGeneratedColumn()
    match_id: number;
    
    @ManyToOne(() => User, user => user.id)
    @JoinColumn({name: 'winner_user'})
    user_id_winner: User;
   
    @ManyToOne(() => User, user => user.id)
    @JoinColumn({name: 'loser_user'})
    user_id_loser: User;

    @CreateDateColumn()
    time_begin: Date;
    
    @CreateDateColumn()
    time_end: Date;

    @Column()
    points: number;
   }

