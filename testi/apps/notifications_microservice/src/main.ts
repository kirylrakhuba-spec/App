import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices'; 
import { NotificationsMicroserviceModule } from './notifications_microservice.module'; 

async function bootstrap() {
 const app = await NestFactory.createMicroservice<MicroserviceOptions>(NotificationsMicroserviceModule,
  {
    transport:Transport.RMQ,
    options: {
          
      urls: ['amqp://innogram:innogram_password@rabbitmq:5672'],
      queue: 'notifications_queue',
      queueOptions: {
      durable: false
      },
    },
  }
 )
 app.listen()
}
bootstrap();