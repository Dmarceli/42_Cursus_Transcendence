import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from 'src/db_interactions_modules/users/user.entity';
import { Channel } from 'src/db_interactions_modules/channels/channel.entity';

@Entity()
export class UserToChannel {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, user => user.id)
  @JoinColumn({ name: 'user_id' })
  user_id: User;

  @ManyToOne(() => Channel, channel => channel.id)
  @JoinColumn({ name: 'channel_id' })
  channel_id: Channel;

  @Column()
  is_owner: boolean;

  @Column()
  is_admin: boolean;

  @Column()
  is_muted: boolean;

  @Column()
  is_banned: boolean;
}