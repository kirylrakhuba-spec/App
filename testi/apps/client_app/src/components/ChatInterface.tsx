import React, { useEffect, useState, useRef } from 'react';
import { Socket } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';

interface ChatInterfaceProps {
    socket: Socket | null;
    client: string; 
}

// Приводим интерфейс к тому, что возвращает БД (примерно)
interface Message {
    _id?: string;
    text: string;
    senderId: string;
    roomId?: string;
    timestamp?: number; // или created_at, проверим в консоли
    created_at?: string;
}

// --- ХЕЛПЕР ДЛЯ ТОКЕНА ---
const getMyIdFromToken = (token: string | null): string | null => {
    if (!token) return null;
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        // Пробуем разные варианты (обычно sub в NestJS)
        return payload.sub || payload.accountId || payload.id || null;
    } catch (e) {
        console.error("Ошибка парсинга токена", e);
        return null;
    }
};

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ socket, client }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');
    const { accessToken } = useAuth();
    
    // Ссылка на конец чата для автоскролла
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const myAccountId = getMyIdFromToken(accessToken);

    const getRoomId = (userId1: string, userId2: string) => {
        return [userId1, userId2].sort().join('_');
    };

    // Автоскролл вниз при новом сообщении
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (!socket || !myAccountId || !client) return;

        const roomId = getRoomId(myAccountId, client);
        console.log(`🔌 Вход в комнату: ${roomId}`);

        // 1. Входим в комнату
        socket.emit('join_room', { roomId });

        // 2. Просим историю сообщений (твоя фича с бэкенда!)
        socket.emit('request_room_history', { roomId });

        // 3. СЛУШАЕМ ИСТОРИЮ (load_all_messages)
        socket.on('load_all_messages', (history: Message[]) => {
            console.log('📜 История загружена:', history);
            setMessages(history);
        });

        // 4. СЛУШАЕМ НОВЫЕ СООБЩЕНИЯ (ИСПРАВЛЕНО ИМЯ СОБЫТИЯ)
        // Бэкенд шлет 'receive_message', а не 'message'
        socket.on('receive_message', (message: Message) => {
            console.log('📩 Новое сообщение:', message);
            setMessages((prev) => [...prev, message]);
        });

        return () => {
            socket.emit('leave_room', { roomId });
            socket.off('receive_message'); // Отписываемся от правильного события
            socket.off('load_all_messages');
            setMessages([]); 
        };
    }, [socket, client, myAccountId]);

    const sendMessage = () => {
        if (socket && inputValue.trim() && myAccountId) {
            const roomId = getRoomId(myAccountId, client);
            
            const msgData = {
                roomId, 
                text: inputValue,
                // Бэкенд сам берет senderId из токена, но для локального отображения можно оставить
            };

            console.log('📤 Отправка:', msgData);
            socket.emit('message', msgData); // Тут имя 'message' верное (см. @SubscribeMessage('message'))
            setInputValue(''); 
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px', background: 'white' }}>
                {messages.length === 0 && <div style={{textAlign: 'center', color: '#888', marginTop: 20}}>Напишите первое сообщение</div>}
                
                {messages.map((msg, index) => {
                    // Важный момент: сравниваем senderId
                    const isMe = msg.senderId === myAccountId;
                    
                    return (
                        <div key={index} style={{ textAlign: isMe ? 'right' : 'left', margin: '5px 0' }}>
                            <div style={{ 
                                display: 'inline-block',
                                background: isMe ? '#007bff' : '#f1f0f0',
                                color: isMe ? 'white' : 'black',
                                padding: '10px 15px',
                                borderRadius: '15px',
                                maxWidth: '70%',
                                wordWrap: 'break-word',
                                textAlign: 'left'
                            }}>
                                {msg.text}
                            </div>
                            {/* Отображение времени (если есть) */}
                            <div style={{ fontSize: '10px', color: '#ccc', marginTop: '2px' }}>
                                {msg.created_at ? new Date(msg.created_at).toLocaleTimeString() : ''}
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            <div style={{ padding: '20px', borderTop: '1px solid #ddd', display: 'flex' }}>
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                    style={{ flex: 1, padding: '10px', borderRadius: '5px', border: '1px solid #ddd', marginRight: '10px' }}
                    placeholder="Напишите сообщение..."
                />
                <button 
                    onClick={sendMessage} 
                    style={{ padding: '10px 20px', background: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
                >
                    Send
                </button>
            </div>
        </div>
    );
};