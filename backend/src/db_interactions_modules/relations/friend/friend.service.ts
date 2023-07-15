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
  //TODO: Validate if friendship already exist and if users id sent exist
  const user1= await this.userRepository.findOne({where: {id: createfriendDto.user1Id} })
  const user2= await this.userRepository.findOne({where: {id: createfriendDto.user2Id} })
   return this.friendRepository.save({...createfriendDto as any});
 }
 async findAll() {
  return await this.friendRepository.find({relations: ['user1Id', 'user2Id' ]});
}

async findByUserId(userId: number) {
  let friendList: Array<User> = [];
  const friendship = await this.friendRepository.find({
    where: [{ user1Id: { id: userId }},
            {user2Id: {id: userId}}
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