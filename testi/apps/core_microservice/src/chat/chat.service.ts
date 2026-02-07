import { Inject, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Message, MessageDocument } from "./message.schema";
import { Model } from "mongoose";
import { ClientProxy, ClientsModule } from "@nestjs/microservices";



@Injectable()
export class ChatService {
  constructor(
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
    @Inject('NOTIFICATION_SERVICE') private delivery: ClientProxy,
  ) {}
   async getAllMessages(room_id): Promise<Message[]>{
    const data = this.messageModel.find({room_id:room_id})
    const sorted_data = data.sort({createdAt : 1})
    return sorted_data.exec()
   }

   async saveMessage(text:string,userId:string,roomId:string): Promise<Message>{
    const newMessage =await this.messageModel.create({
      text: text,
        senderId: userId,
        room_id:roomId
    })
    this.delivery.emit('message_created',{newMessage})
    return newMessage
   }
}