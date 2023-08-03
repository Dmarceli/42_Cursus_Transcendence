import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { EventCreateDto } from './dtos/events.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Events } from './events.entity';
import { Any, Repository} from 'typeorm';
import { User } from '../users/user.entity';
import { UsersService } from '../users/users.service';
import { friendService } from '../relations/friend/friend.service';
import { AppService } from 'src/app.service';
import { CreateFriendDto } from '../relations/friend/dtos/friend.dto';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Events) private eventsRepository: Repository<Events>,
    @InjectRepository(User) private UserRepository: Repository<User> ,

    private usersService: UsersService,
    private FriendsService: friendService,
    private appService: AppService,
 
   ) {}

  async create(createEventDto: EventCreateDto, event_type: number) {
		const already_requested = await this.eventsRepository.findOne({where: {decider_user:{id: createEventDto.decider_user},requester_user: {id: createEventDto.requester_user}, type:event_type},
      relations: ['requester_user', 'decider_user'],})
		// if(event_type == 1){
    //   const already_friends = this.FriendsService.findFriendshipByIDS(createEventDto.decider_user, createEventDto.requester_user)
    //   if(already_friends)
    //     return "2"
    // }
    if(already_requested)
      return "2"
    console.log(event_type)
        try {
      const AA=await this.eventsRepository.save({
        ...createEventDto as any,
        time: new Date(),
        type: event_type.valueOf(),
        already_seen: false
      });
      console.log(AA)
    } catch (error) {
      console.error('Error notifying user:', error);
    }
    try {
      await this.appService.user_to_notify(createEventDto.decider_user);
    } catch (error) {
      console.error('Error notifying user:', error);
    }
  }

  async closedecision(decision_: string, event_id: number){
    const event = await this.eventsRepository.findOne({
      where: { 
        id: event_id },
        relations: ['requester_user', 'decider_user'],
    });
   
    if(decision_ == 'true' && event){
      if (event.type == 1){
        const newfriend: CreateFriendDto = {
          user1Id : event.decider_user.id , 
          user2Id : event.requester_user.id
        }
        await this.FriendsService.createfriend(newfriend);
      }        
    } 
    await this.eventsRepository.delete(event);
  }


  async findAll_for_user(user_id :number) {
    const user = await this.UserRepository.findOneBy({id: user_id})
    return await this.eventsRepository.find({where: {decider_user : user},relations: ['requester_user','decider_user' ]});
  }

  
  async markNotificationAsSeen(notificationId: number): Promise<void> {
    await this.eventsRepository.update(notificationId, { already_seen: true });
  }
  // findOne(id: number) {
  //   return `This action returns a #${id} gameHistory`;
  // }

  // update(id: number, updateGameHistoryDto: UpdateGameHistoryDto) {
  //   return `This action updates a #${id} gameHistory`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} gameHistory`;
  // }
}
