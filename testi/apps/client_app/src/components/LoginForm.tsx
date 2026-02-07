import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // 1. Импорт useNavigate
import api from '../api'; // Проверь путь (../api или ../lib/api)
import { useAuth } from '../context/AuthContext';
import styles from './SignUpForm.module.css'; // Можешь оставить старые стили, если лень менять

// ПЕРЕИМЕНОВАЛ В LoginForm, чтобы не путаться
export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');  
  const [error, setError] = useState<string | null>(null);
  
  const { login } = useAuth();
  const navigate = useNavigate(); // 2. Инициализация хука

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await api.post('/auth/login', {
        email,
        password,
      });
      
      // Сохраняем токены
      login(response.data.accessToken, response.data.refreshToken);
      
      console.log('Успех!', response.data);

      // 3. ЯВНЫЙ ПЕРЕХОД В ПРОФИЛЬ
      // Мы говорим: "Всё ок, вези меня домой"
      navigate('/profile'); 

    } catch (err: any) {
      console.error('Ошибка:', err.response?.data);
      if (err.response?.status === 401) {
        setError('Неверный email или пароль');
      } else {
        setError('Ошибка входа. Попробуй ещё раз');
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <h2>Вход</h2>
      
      <input 
        type="email" 
        placeholder="Email" 
        value={email} 
        onChange={(e) => setEmail(e.target.value)} 
        required 
        className={styles.input}
      />
      <input 
        type="password" 
        placeholder="Пароль" 
        value={password} 
        onChange={(e) => setPassword(e.target.value)} 
        required  
        className={styles.input}
      />
      
      <button type="submit" className={styles.button}>Войти</button>
      
      <p style={{ textAlign: 'center', marginTop: '10px' }}>
        Нет аккаунта? <Link to="/signup">Зарегистрироваться</Link>
      </p>
      
      {error && <p className={styles.error}>{error}</p>}
    </form>
  );
}