import {WebSocketGateway,OnGatewayConnection,WebSocketServer,SubscribeMessage, 
  MessageBody,     
  ConnectedSocket} from '@nestjs/websockets'
import {Server,Socket} from 'socket.io'
import { JwtService } from '@nestjs/jwt';
import { ChatService } from './chat.service';

@WebSocketGateway({cors:{origin: '*'}})
export class ChatGateway implements OnGatewayConnection{
    constructor(
        private readonly chatService: ChatService,
        private readonly jwtService: JwtService,
      
    ){}
    @WebSocketServer()
    server: Server

    async handleConnection(client: Socket) {
        try{
            const token = client.handshake.auth.token

            const payload = this.jwtService.verify(token)

            client.data.account = payload

            console.log('Юзер подключился:', payload.sub);
        }catch(error){
            console.log('Неверный токен, пока!');
        client.disconnect();
        }
    }
    @SubscribeMessage('message')
    async handleMessage(
        @MessageBody() data:{text:string,roomId:string},
        @ConnectedSocket() client: Socket
    ){
        const senderId = client.data.account.sub

        const createdMessage = await this.chatService.saveMessage(
            data.text,
            senderId,
            data.roomId
        )
        this.server.to(data.roomId).emit('receive_message', createdMessage)
    }

    @SubscribeMessage('ping')
        handlePing(@MessageBody() data:any,@ConnectedSocket() client: Socket){
            console.log('Кто нажал кнопку (ID из БД):', client.data.account.sub);
        }
    
    @SubscribeMessage(`request_room_history`)
        async getAllMessages(
            @ConnectedSocket() client:Socket,
            @MessageBody() data:{roomId:string}
        ){const messages = await this.chatService.getAllMessages(data.roomId)
            client.emit('load_all_messages', messages)
        }
        @SubscribeMessage('join_room')
    joinRoom(@MessageBody() data:{roomId:string},@ConnectedSocket() client: Socket){
        client.join(data.roomId)
    }
    }

    