import React, { useEffect, useState } from 'react'; // Импортируем хуки
import api from '../api';


interface Profile {
    id: string;         
    user_id: string;     
    username: string;
    display_name?: string;
    avatar_url?: string;
    user: {
        accountId:string;
    }
}

interface UserListProps {
    onSelectUser: (accountId: string) => void; 
}

export const UserList: React.FC<UserListProps> = ({ onSelectUser }) => {
    
    const [profiles, setProfiles] = useState<Profile[]>([]) 

    useEffect(() => {
        const fetchProfiles = async () => {
            try {
                
                const response = await api.get('/profiles');
                
                
                setProfiles(response.data);
            } catch (error) {
                console.error("Не удалось загрузить пользователей", error);
            }
        };

        fetchProfiles();
    }, []);

    return (
        <div style={{ width: '250px', borderRight: '1px solid #ccc', overflowY: 'auto' }}>
            <h3 style={{ padding: '10px' }}>Контакты</h3>
            <ul style={{ listStyle: 'none', padding: 0 }}>
                {profiles.map((profile) => (
                    <li 
                        key={profile.id}
                       
                        onClick={() => onSelectUser(profile.user.accountId)}
                        
                        style={{ padding: '10px', cursor: 'pointer', borderBottom: '1px solid #eee' }}
                    >
                        
                        {profile.username}
                    </li>
                ))}
            </ul>
        </div>
    );
};