import { Module } from '@nestjs/common';
import { NotificationsMicroserviceController } from './notifications_microservice.controller';
import { NotificationsMicroserviceService } from './notifications_microservice.service';

@Module({
  imports: [],
  controllers: [NotificationsMicroserviceController],
  providers: [NotificationsMicroserviceService],
})
export class NotificationsMicroserviceModule {}
