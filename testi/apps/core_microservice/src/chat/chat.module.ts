import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
// import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Message, MessageSchema } from './message.schema';
import { ChatService } from './chat.service';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [MongooseModule.forRootAsync({
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => ({
    uri: configService.get<string>('MONGO_URI'),
  }),
}),
    MongooseModule.forFeature([{name: Message.name, schema: MessageSchema}])
    ,JwtModule.registerAsync({
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => ({
    secret: configService.get('JWT_SECRET'),
    signOptions: { expiresIn: '15m' },
  }),}),

  ClientsModule.register([
      {
        name: 'NOTIFICATION_SERVICE', // Это имя токена для инъекции
        transport: Transport.RMQ,
        options: {
          
          urls: ['amqp://innogram:innogram_password@rabbitmq:5672'],
          queue: 'notifications_queue',
          queueOptions: {
            durable: false
          },
        },
      },
    ]),

],
  
  providers: [ChatGateway,ChatService],
  
})
export class ChatModule {}
