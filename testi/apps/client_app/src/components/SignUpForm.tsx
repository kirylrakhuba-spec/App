
import React, { useState } from 'react';
import api from '../api'; 
import styles from './SignUpForm.module.css';
import { Link } from 'react-router-dom';
export default function SignUpForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [birthday, setBirthday] = useState('');
  const [bio, setBio] = useState('');
  
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    try {
      const response = await api.post('/auth/signup', {
        email,
        password,
        username,
        displayName,
        birthday,
        bio: bio || '',
      });

      setSuccess(true);
      console.log('Успех!', response.data);

    } catch (err: any) {
      console.error('БЭКЕНД ВЕРНУЛ ОШИБКУ:', err.response.data);
      if (err.response?.status === 409) {
        setError('Этот email уже занят');
      } else {
        setError('Ошибка регистрации. Попробуй ещё раз');
      }
      console.error(err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <h2>Регистрация</h2>
      
      <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required className={styles.input}/>
      <input type="password" placeholder="Пароль" value={password} onChange={(e) => setPassword(e.target.value)} required  className={styles.input}/>
      <input type="text" placeholder="Юзернейм" value={username} onChange={(e) => setUsername(e.target.value)} required className={styles.input}/>
      <input type="text" placeholder="Отображаемое имя" value={displayName} onChange={(e) => setDisplayName(e.target.value)} required className={styles.input}/>
      <input type="text" placeholder="Расскажите о себе" value={bio} onChange={(e) => setBio(e.target.value)}  className={styles.input}/>
      <input type="date" placeholder="Дата рождения" value={birthday} onChange={(e) => setBirthday(e.target.value)} required className={styles.input}/>
      
      <button type="submit" className={styles.button}>Зарегистрироваться</button>
      <p style={{ textAlign: 'center', marginTop: '10px' }}>
    Уже есть аккаунт? <Link to="/login">Войти</Link>
  </p>
      
      {error && <p className={styles.error}>{error}</p>}
      {success && <p className={styles.success}>Успех! Теперь можешь залогиниться.</p>}
    </form>
  );
}