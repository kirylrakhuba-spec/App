import { useEffect, useState } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import CreatePostForm from './CreatePostForm';
import styles from './ProfilePage.module.css';

// Если VITE_API_URL не задан, используем localhost:3001
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface Post {
  id: string;
  imageUrl: string;
  caption: string;
  created_at: string;
  profile: {
    username: string;
    avatar_url: string | null;
  };
} 

interface UserProfile {
  id: string;
  username: string;
  display_name: string;
  bio: string;
  birthday: string;
  avatar_url: string | null;
}

export default function ProfilePage() {
  const { logout } = useAuth();
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchProfile = async () => {
    const response = await api.get('/users/current_user');
    setProfile(response.data);
  };

  const fetchPosts = async () => {
    try {
      const response = await api.get('/posts');
      console.log('ЛЕНТА ПРИШЛА:', response.data); // <-- Лог для проверки
      setPosts(response.data); 
    } catch (err) {
      console.error('Ошибка загрузки постов:', err);
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        await Promise.all([fetchProfile(), fetchPosts()]);
      } catch (err: any) {
        console.error('ОШИБКА ИНИЦИАЛИЗАЦИИ:', err);
        setError('Не удалось загрузить данные');
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  if (loading) return <div style={{color: 'white', textAlign: 'center', marginTop: '20px'}}>Загрузка...</div>;

  if (error) {
    return (
        <div style={{color: 'red', textAlign: 'center', marginTop: '20px'}}>
            <h3>{error}</h3>
            <button onClick={logout}>Выйти</button>
        </div>
    );
  }

  if (!profile) {
    return (
        <div style={{color: 'white', textAlign: 'center', marginTop: '20px'}}>
            <h3>Профиль не найден</h3>
            <button onClick={logout}>Выйти</button>
        </div>
    );
  }

  const handleDeletePost = async (postId: string) => {
    // 1. Спрашиваем юзера
    if (!window.confirm('Ты реально хочешь удалить этот шедевр?')) {
      return;
    }

    try {
      // 2. Звоним на бэк
      await api.delete(`/posts/${postId}`);

      // 3. Обновляем UI мгновенно (убираем пост из списка)
      setPosts((prevPosts) => prevPosts.filter(post => post.id !== postId));
      
    } catch (err) {
      console.error('Не удалось удалить пост', err);
      alert('Ошибка удаления. Может, это не твой пост?');
    }
  };

  // Защита для аватарки профиля
  const profileInitial = (profile?.username || '?').charAt(0).toUpperCase();

  return (
    <div className={styles.container}>
      
      {/* --- КАРТОЧКА ПРОФИЛЯ --- */}
      <div className={styles.card} style={{ marginBottom: '20px' }}>
        <div className={styles.header}>
            <div className={styles.avatarPlaceholder}>
                {profileInitial}
            </div>
            <h2>{profile.display_name || 'Без имени'}</h2>
            <p className={styles.username}>@{profile.username || 'anon'}</p>
        </div>

        <div className={styles.body}>
            <div className={styles.infoRow}>
                <strong>ID:</strong> <span>{profile.id}</span>
            </div>
            <div className={styles.infoRow}>
                <strong>О себе:</strong> <span>{profile.bio || 'Пусто...'}</span>
            </div>
            <div className={styles.infoRow}>
                <strong>ДР:</strong> <span>{profile.birthday ? new Date(profile.birthday).toLocaleDateString() : 'Не указано'}</span>
            </div>
        </div>

        <button onClick={logout} className={styles.logoutButton}>
          Выйти из аккаунта
        </button>
      </div>

      {/*  create post form */}
      <div style={{ width: '100%', maxWidth: '800px' }}>
          <CreatePostForm onPostCreated={fetchPosts} />
      </div>

    
      <div style={{ width: '100%', maxWidth: '800px', display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '50px' }}>
        {posts.map((post) => {
            const authorName = post.profile?.username || 'Unknown';
            const authorInitial = authorName.charAt(0).toUpperCase();
            const canDelete = true; 

            return (
              <div key={post.id} className={styles.postCard}>
                
                <div className={styles.postHeader}>
                    <div className={styles.postAuthor}>
                        <div className={styles.postAvatar}>
                            {authorInitial}
                        </div>
                        <span className={styles.postUsername}>@{authorName}</span>
                    </div>

                    {/* delete btn */}
                    {canDelete && (
                        <button 
                            onClick={() => handleDeletePost(post.id)} 
                            className={styles.deleteBtn}
                            title="Удалить пост"
                        >
                            🗑️
                        </button>
                    )}
                </div>

                
                <img 
                    src={`${API_URL}${post.imageUrl}`} 
                    alt="Post" 
                    className={styles.postImage}
                    onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/500x300?text=Image+Not+Found';
                    }} 
                />

            
                <div className={styles.postContent}>
                    <p className={styles.postCaption}>{post.caption}</p>
                    <span className={styles.postDate}>
                        {new Date(post.created_at).toLocaleString()}
                    </span>
                </div>
              </div>
            );
        })}
      </div>

    </div>
  );
}