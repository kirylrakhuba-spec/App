import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom"; // Хуки для URL
import api from "../api"; // Проверь путь к своему api
import UserSearch from "./UserSearch";
import styles from "./ProfilePage.module.css"; // Используем общие стили

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface Post {
  id: string;
  imageUrl: string;
  caption: string;
  created_at: string;
}

interface UserProfile {
  id: string;
  username: string;
  display_name: string;
  bio: string;
  birthday: string;
  avatar_url: string | null;
  posts: Post[]; // В публичном профиле посты лежат внутри
  isFollowing?: boolean;
}

export default function PublicProfilePage() {
  const { username } = useParams(); // Достаем ник из адреса
  const navigate = useNavigate();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const [isFollowing,setIsFollowing] = useState(false)
  const [followLoading,setFollowLoading] = useState(false)
  useEffect(() => {
    const loadData = async () => {
      if (!username) return;
      setLoading(true);
      try {
        // Запрос на Бэк (GET /profiles/:username)
        const response = await api.get(`/profiles/${username}`);
        setProfile(response.data);

        if (response.data.isFollowing !== undefined) {
           setIsFollowing(response.data.isFollowing);
        }
        
      } catch (err) {
        console.error('Ошибка загрузки:', err);
        alert('Пользователь не найден');
        navigate('/'); // Если не нашли - кидаем домой
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [username, navigate]);

  const handleFollowToggle = async () => {
    if(!profile) return
    setFollowLoading(true)
    try{
      if(isFollowing){
        await api.delete(`/profiles/${username}/follow`)
        setIsFollowing(false)
      }else{
        await api.post(`/profiles/${username}/follow`)
        setIsFollowing(true)
      }
    }catch(error){
      console.error('Ошибка подписки:', error);
      alert('Не удалось изменить подписку');
    }finally{
      setFollowLoading(false)
    }
  }

  if (loading) return <div style={{color: 'white', textAlign: 'center', marginTop: '50px'}}>Загрузка...</div>;
  
  if (!profile) return null;

  // Аватарка профиля
  const avatarContent = profile.avatar_url 
    ? <img src={`${API_URL}${profile.avatar_url}`} className={styles.realAvatar} alt="Avatar" />
    : (profile.username || '?').charAt(0).toUpperCase();

  return (
    <div className={styles.pageLayout}>
      
      {/* 1. ПОИСК И КНОПКА ДОМОЙ */}
      <div className={styles.topSection}>
         <button onClick={() => navigate('/profile')} className={styles.homeBtn}>
            🏠 <span className={styles.homeBtnText}>Домой</span>
         </button>
         <div style={{ flex: 1, maxWidth: '600px' }}>
            <UserSearch />
         </div>
      </div>

      <div className={styles.contentGrid}>

          {/* 2. ЛЕВАЯ КОЛОНКА: ИНФО */}
          <aside className={styles.leftColumn}>
            <div className={styles.card}>
                <div className={styles.header}>
                    <div className={styles.avatarPlaceholder} style={profile.avatar_url ? {background: 'transparent', padding: 0} : {}}>
                        {avatarContent}
                    </div>
                    <h2>{profile.display_name}</h2>
                    <p className={styles.username}>@{profile.username}</p>
                    
                    {/* Заглушка кнопки подписки */}
                    <button 
                        onClick={handleFollowToggle}
                        disabled={followLoading}
                        className={isFollowing ? styles.unfollowBtn : styles.followBtn}
                    >
                        {followLoading ? '...' : (isFollowing ? 'Отписаться' : 'Подписаться')}
                    </button>

                </div>

                <div className={styles.body}>
                    <div className={styles.infoRow}>
                         <strong>О себе:</strong> <span>{profile.bio || '-'}</span>
                    </div>
                    <div className={styles.infoRow}>
                        <strong>ДР:</strong> <span>{profile.birthday ? new Date(profile.birthday).toLocaleDateString() : '-'}</span>
                    </div>
                </div>
            </div>
          </aside>

          {/* 3. ПРАВАЯ КОЛОНКА: ЛЕНТА */}
          <main className={styles.rightColumn}>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '50px' }}>
                
                {profile.posts && profile.posts.map((post) => {
                    const postAvatarUrl = profile.avatar_url;
                    const postAvatarContent = postAvatarUrl
                        ? <img src={`${API_URL}${postAvatarUrl}`} style={{width:'100%', height:'100%', objectFit:'cover', borderRadius: '50%'}} />
                        : profile.username.charAt(0).toUpperCase();

                    return (
                        <div key={post.id} className={styles.postCard}>
                            <div className={styles.postHeader}>
                                <div className={styles.postAuthor}>
                                    <div className={styles.postAvatar} style={postAvatarUrl ? {background:'transparent', padding:0} : {}}>
                                        {postAvatarContent}
                                    </div>
                                    <span className={styles.postUsername}>@{profile.username}</span>
                                </div>
                            </div>
                            <img 
                                src={`${API_URL}${post.imageUrl}`} 
                                alt="Post" 
                                className={styles.postImage} 
                                onError={(e) => (e.target as HTMLImageElement).src = 'https://placehold.co/600x400?text=Error'} 
                            />
                            <div className={styles.postContent}>
                                <p className={styles.postCaption}>{post.caption}</p>
                                <span className={styles.postDate}>{new Date(post.created_at).toLocaleString()}</span>
                            </div>
                        </div>
                    );
                })}

                {(!profile.posts || profile.posts.length === 0) && (
                    <div style={{textAlign:'center', color:'#666', marginTop: '20px'}}>
                        У пользователя нет постов
                    </div>
                )}
             </div>
          </main>

      </div>
    </div>
  );
}