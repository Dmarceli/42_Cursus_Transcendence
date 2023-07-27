import { Controller,UseGuards, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventCreateDto } from './dtos/events.dto';
import { getUserIDFromToken } from 'src/db_interactions_modules/users/getUserIDFromToken';
import { JwtAuthGuard } from 'src/auth/jwt/jwt-auth.guard';
import { User } from '../users/user.entity';


@UseGuards(JwtAuthGuard)
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post('/friendship_request')
  create_friendship_request(@Body() createEventDto: EventCreateDto) {
    return this.eventsService.create(createEventDto, 1);
  }

  @Post('/channel_join_request')
  create_channel_join_request(@Body() createEventDto: EventCreateDto) {
    return this.eventsService.create(createEventDto, 0);
  }

  @Post('/event_decision/:event_id/:decision')
  event_decision(@Param('decision') decision: boolean, @Param('event_id') event_id: number) {
    return this.eventsService.closedecision(decision, event_id);
  }

  @Get('/notifications')
  findAll(@getUserIDFromToken() user: User) {
    return this.eventsService.findAll_for_user(user.id);
  }

  @Post('/mark_seen/:notificationId')
  async markNotificationAsSeen(@Param('notificationId') notificationId: number){
    await this.eventsService.markNotificationAsSeen(notificationId);
  }

  @Post('/mark_seen_all')
  async markAllNotificationsAsSeen(@Body() IDS: any){
    const { unseenNotificationIds } = IDS;
    for (const notificationId of unseenNotificationIds) {
      await this.eventsService.markNotificationAsSeen(notificationId);
    }
  }
  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.gameHistoryService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateGameHistoryDto: UpdateGameHistoryDto) {
  //   return this.gameHistoryService.update(+id, updateGameHistoryDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.gameHistoryService.remove(+id);
  // }
}
