import { Injectable } from '@nestjs/common';
import { EventCreateDto } from './dtos/events.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Events } from './events.entity';
import { Any, Repository} from 'typeorm';
import { User } from '../users/user.entity';
@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Events) private eventsRepository: Repository<Events>,
     @InjectRepository(User) private UserRepository: Repository<User>
   ) {}

  async create(createEventDto: EventCreateDto, event_type: number) {
    return await this.eventsRepository.save({
      ...createEventDto as any,
      time: new Date(),
      type: event_type,
      already_seen: false
    });
  }

  async closedecision(decision: boolean, event_id: number){
    const event=await this.eventsRepository.findOneBy({id: event_id})
    // switch()
    // case ''
    await this.eventsRepository.delete(event)
  }
  async findAll_for_user(user_id :number) {
    const user= await this.UserRepository.findOneBy({id: user_id})
    return await this.eventsRepository.find({where: {decider_user : user},relations: ['requester_user','decider_user' ]});
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
