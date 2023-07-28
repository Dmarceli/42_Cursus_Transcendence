import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { friend } from './friend.entity';
import { CreateFriendDto } from './dtos/friend.dto';
import { User } from 'src/db_interactions_modules/users/user.entity';
 
@Injectable()
export class friendService {
 constructor(
   @InjectRepository(friend) private friendRepository: Repository<friend>,
   @InjectRepository(User) private userRepository: Repository<User>
 ) {}
 async createfriend(createfriendDto: CreateFriendDto) {
  console.log(createfriendDto)
  const user1 = await this.userRepository.findOne({where: {id: createfriendDto.user1Id} })
  const user2 = await this.userRepository.findOne({where: {id: createfriendDto.user2Id} })
   return this.friendRepository.save({...createfriendDto as any, is_block: false});
 }


 async blockuser(user_to_block: number, user: number) {
  const to_block= await this.userRepository.findOne({where: {id: user_to_block} })
  const user1= await this.userRepository.findOne({where: {id: user} })
   return this.friendRepository.save({
    user1Id: user1,
    user2Id: to_block,
    is_block: true
   });
 }
 async findAll() {
  return await this.friendRepository.find({relations: ['user1Id', 'user2Id' ], where: {is_block: false}});
}

async findByUserId(userId: number) {
  let friendList: Array<User> = [];
  const friendship = await this.friendRepository.find({
    where: [{ user1Id: { id: userId}, is_block: false},
            {user2Id: {id: userId}, is_block: false}
            ],
    relations:['user1Id', 'user2Id']
  });
  for (const k in friendship) {
    if(friendship[k].user1Id.id == userId)
      friendList.push(friendship[k].user2Id)
    else
      friendList.push(friendship[k].user1Id)
  }
  return  friendList
}

async get_blockedusers(userId: number) {
  const blocked_list = await this.friendRepository.find({
    where: [{ user1Id: { id: userId}, is_block: true}],
    relations:['user1Id', 'user2Id'],
    select:{user1Id: {id: true, intra_nick: true}, user2Id: {id: true, intra_nick: true}}
  });
 
  return  blocked_list
}

async delete_friend(id1: number,id2: number) {
  const friendship = await this.friendRepository.findOne({
    where: [{ user1Id: {id: id1}, user2Id: {id: id2}}, 
           { user1Id: {id: id2}, user2Id: {id: id1}}
          ], 
    relations:['user1Id', 'user2Id']
});
  await this.friendRepository.remove(friendship)
  return friendship
}
}