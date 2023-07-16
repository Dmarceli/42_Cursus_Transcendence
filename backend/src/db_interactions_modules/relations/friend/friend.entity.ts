import { Entity, Column,ManyToOne, JoinColumn, PrimaryGeneratedColumn } from 'typeorm';
import { User } from 'src/db_interactions_modules/users/user.entity';

@Entity()
export class friend {
  @PrimaryGeneratedColumn()
  friendship_id: number;

  @ManyToOne(() => User, user => user.id)
  @JoinColumn({ name: 'user1Id' })
  user1Id: User;

  @ManyToOne(() => User, user => user.id)
  @JoinColumn({ name: 'user2Id' })
  user2Id: User;

  @Column({nullable: true})
  is_block: boolean;
}
