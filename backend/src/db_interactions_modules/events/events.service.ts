import { Injectable } from '@nestjs/common';
import { EventCreateDto } from './dtos/events.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Events } from './events.entity';
import { Any, Repository} from 'typeorm';
@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Events) private eventsRepository: Repository<Events>,
   ) {}

  async create(createEventDto: EventCreateDto, event_type: number) {
    return this.eventsRepository.create({
      ...createEventDto as any,
      time: new Date(),
      type: event_type
    });
  }

  async closedecision(decision: boolean, event_id: number){
    const event=await this.eventsRepository.findOneBy({id: event_id})
    // switch()
    // case ''
    await this.eventsRepository.delete(event)
  }
  // findAll() {
  //   return `This action returns all gameHistory`;
  // }

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
