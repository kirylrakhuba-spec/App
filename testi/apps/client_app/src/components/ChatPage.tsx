import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import { ChatInterface } from "./ChatInterface";
import { UserList } from './UserList';
export const ChatPage = () => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const {accessToken} = useAuth()
    const [recipientId, setRecipientId] = useState<string | null>(null);
    useEffect(() => {
        if(!accessToken){
            return
        }
        const newSocket = io('http://localhost:3001',{auth:{token: accessToken}});
        setSocket(newSocket);

    
        newSocket.on('connect', () => console.log('Connected'));
        // newSocket.on('message', (messageFromBackend) => {
        //     console.log('ПРИШЕЛ ОТВЕТ ОТ СЕРВЕРА:', messageFromBackend);
        //     alert('Сообщение сохранено! ID: ' + messageFromBackend._id);
        // });
        return () => { newSocket.disconnect(); };
    }, [accessToken]);

    // const sendPing = () => {
    //     if (socket) {
    //         console.log('Отправляю ПИНГ...');
           
    //         socket.emit('ping', { message: 'Привет с кнопки!' });
    //     }
    // };

// const sendMessage = () => {
//         if (socket) {
//             console.log('📤 Отправляю данные на сервер...');
//             // Отправляем событие 'message' с объектом { text: ... }
//             socket.emit('message', { text: 'Первый тест базы!' });
//         }
//     };

 return (
        // ГЛАВНЫЙ КОНТЕЙНЕР
        // display: 'flex' ставит детей в ряд (горизонтально).
        // height: '100vh' растягивает окно на всю высоту экрана.
        <div style={{ display: 'flex', height: '100vh', width: '100%' }}>
            
            {/* ЛЕВАЯ КОЛОНКА: Список пользователей */}
            {/* Мы передаем функцию setRecipientId, чтобы список мог менять стейт родителя */}
            <UserList onSelectUser={(id) => setRecipientId(id)} />

            {/* ПРАВАЯ КОЛОНКА: Область чата */}
            {/* flex: 1 заставляет этот блок занять всё свободное место */}
            <div style={{ flex: 1, padding: '20px', backgroundColor: '#f5f5f5' }}>
                
                {/* УСЛОВИЕ: */}
                {/* Если recipientId существует (мы кого-то выбрали) -> Показываем Чат */}
                {/* Если recipientId равен null -> Показываем текст "Выберите чат" */}
                
                { recipientId ? (
                    <ChatInterface 
                        socket={socket} 
                        // ВАЖНО: Передаем выбранный ID, а не жесткую строку
                        client={recipientId} 
                    />
                ) : (
                    <div style={{ marginTop: '50px', textAlign: 'center' }}>
                        <h3>Выберите, кому написать</h3>
                    </div>
                )}

            </div>
        </div>
    );
};