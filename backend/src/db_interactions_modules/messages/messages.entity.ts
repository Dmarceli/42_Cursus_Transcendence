import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    ManyToOne, 
    JoinColumn
   } from 'typeorm';
import { User } from '../users/user.entity';
import { Channel } from '../channels/channel.entity';
    
   @Entity()
   export class Messages {
    @PrimaryGeneratedColumn()
    id: number;
    
    @ManyToOne(() => User, user => user.id)
    @JoinColumn({ name: 'authorId' })
    author: User;

        
    @Column()
    message: string;
    
    @CreateDateColumn()
    time: Date;

   @ManyToOne(() => Channel, channel => channel.id)
   @JoinColumn({ name: 'channelId' })
   channel: Channel;

   }