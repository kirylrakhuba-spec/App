import { useAuth } from '../context/AuthContext';
import React, { useState } from 'react';
import api from '../api'; 
import styles from './SignUpForm.module.css';
import { Link } from 'react-router-dom';


export default function SignUpForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');  
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const {login} = useAuth()
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    try {
 
      const response = await api.post('/auth/login', {
        email,
        password,
      });
      login(response.data.accessToken, response.data.refreshToken)
      setSuccess(true);
      console.log('Успех!', response.data);
      

    } catch (err: any) {
      console.error('БЭКЕНД ВЕРНУЛ ОШИБКУ:', err.response.data);
      if (err.response?.status === 401) {
        setError('Неверный email или пароль');
      } else {
        setError('Попробуй ещё раз');
      }
      console.error(err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <h2>Вход</h2>
      
      <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required className={styles.input}/>
      <input type="password" placeholder="Пароль" value={password} onChange={(e) => setPassword(e.target.value)} required  className={styles.input}/>
      
      
      <button type="submit" className={styles.button}>Войти</button>
      <p style={{ textAlign: 'center', marginTop: '10px' }}>
    Нет аккаунта? <Link to="/signup">Зарегистрироваться</Link>
  </p>
      
      {error && <p className={styles.error}>{error}</p>}
      {success && <p className={styles.success}>Успех! .</p>}
    </form>
  );
}