import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Хук для смены страницы без перезагрузки
import api from '../api'; 
import styles from './UserSearch.module.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface SearchResult{
    id: string,
    username: string,
    display_name: string,
    avatar_url: string | null
}

interface Props {
  excludeUsername?: string;
}

export default function UserSearch({excludeUsername}:Props){

    const [query, setQuery] = useState<string>('')
    const [results,setResults] = useState<SearchResult[]>([])

    const navigate =  useNavigate()

    
  useEffect(() => {

    
    if (!query.trim()) {
      setResults([]);
      return;
    }

    
    const timeoutId = setTimeout(async () => {
      try {
        console.log('Отправляю запрос на сервер:', query); 
        const response = await api.get(`/profiles/search?q=${query}`);
        const filteredResults = response.data.filter(
            (user: SearchResult) => user.username !== excludeUsername
        );
        setResults(filteredResults);
      } catch (err) {
        console.error('Ошибка поиска', err);
      }
    }, 500);

    
    return () => {
        // cansel previos timer
       
        clearTimeout(timeoutId);
    };

  }, [query, excludeUsername]); 

  
  const handleSelectUser = (username: string) => {
    navigate(`/users/${username}`); 
    setQuery('');   
    setResults([]);  
  };

  return (
    <div className={styles.container}>
      
      <input
        type="text"
        placeholder="Поиск людей (@username)..."
        value={query}
        onChange={(e) => setQuery(e.target.value)} 
        className={styles.input}
      />

      
      {results.length > 0 && (
        <div className={styles.resultsList}>
          {results.map((user) => (
            <div 
              key={user.id} 
              className={styles.resultItem}
              onClick={() => handleSelectUser(user.username)}
            >
              
              <div className={styles.avatar}>
                 
                 {user.avatar_url ? (
                    <img src={`${API_URL}${user.avatar_url}`} alt="Ava" style={{width:'100%', height:'100%', borderRadius:'50%', objectFit:'cover'}} />
                 ) : (
                    user.username.charAt(0).toUpperCase()
                 )}
              </div>
              
              
              <div className={styles.info}>
                <span className={styles.displayName}>{user.display_name}</span>
                <span className={styles.username}>@{user.username}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}