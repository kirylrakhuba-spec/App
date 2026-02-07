import { Controller, Get } from '@nestjs/common';
import { NotificationsMicroserviceService } from './notifications_microservice.service';
import { Ctx, EventPattern, Payload, RmqContext} from '@nestjs/microservices'

@Controller()
export class NotificationsMicroserviceController {
  // constructor(private readonly notificationsMicroserviceService: NotificationsMicroserviceService) {}

  @EventPattern('message_created')
  async handleMessage(@Payload() data:{ newMessage: { text: string, senderId: string, room_id: string } },@Ctx() context: RmqContext){
     console.log(`⚡ [Notification Service] Получено событие!`);
    
   
    console.log('📦 Payload:', data);
  }
 
}
