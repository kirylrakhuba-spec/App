import { useEffect, useState } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import CreatePostForm from './CreatePostForm';
import EditProfileModal from './EditProfileModal'; // 👈 1. ИМПОРТ
import styles from './ProfilePage.module.css';
import UserSearch from './UserSearch';
import { Link } from 'react-router-dom';
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

  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);


  const fetchProfile = async () => {
    const response = await api.get('/profiles/me');
    setProfile(response.data);
  };

  const fetchPosts = async () => {
    try {
      const response = await api.get('/posts');
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

  const handleDeletePost = async (postId: string) => {
    if (!window.confirm('Удалить пост?')) return;
    try {
      await api.delete(`/posts/${postId}`);
      setPosts((prev) => prev.filter(p => p.id !== postId));
    } catch (err) {
      alert('Ошибка удаления');
    }
  };

  if (loading) return <div style={{color: 'white', textAlign: 'center', marginTop: '20px'}}>Загрузка...</div>;
  if (error) return <div style={{color: 'red', textAlign: 'center'}}>{error} <button onClick={logout}>Выход</button></div>;
  if (!profile) return <div style={{color: 'white', textAlign: 'center'}}>Профиль не найден <button onClick={logout}>Выход</button></div>;

  // avatar image (if load), or leter
  const avatarContent = profile.avatar_url 
    ? <img src={`${API_URL}${profile.avatar_url}`} alt="Avatar" className={styles.realAvatar} />
    : (profile.username || '?').charAt(0).toUpperCase();

 return (
    <div className={styles.pageLayout}> {/* 1. ГЛАВНАЯ ОБЕРТКА */}
      
      {/* 2. ВЕРХНЯЯ СЕКЦИЯ (ПОИСК) */}
      <div className={styles.topSection}>
         <UserSearch excludeUsername={profile?.username} />
      </div>

      {/* 3. СЕТКА (ЛЕВО + ПРАВО) */}
      <div className={styles.contentGrid}>
      <Link to={'/chat'}><button>Чат</button></Link>
          {/* --- ЛЕВАЯ КОЛОНКА: ПРОФИЛЬ (LIPKY) --- */}
          <aside className={styles.leftColumn}>
            <div className={styles.card}>
                <div className={styles.header}>
                    <div className={styles.avatarPlaceholder} style={profile.avatar_url ? {background: 'transparent', padding: 0} : {}}>
                        {avatarContent}
                    </div>
                    <h2>{profile.display_name || 'Без имени'}</h2>
                    <p className={styles.username}>@{profile.username}</p>

                    <button 
                        onClick={() => setIsEditModalOpen(true)}
                        style={{
                            marginTop: '15px',
                            background: 'transparent',
                            border: '1px solid #555',
                            color: '#ccc',
                            padding: '6px 12px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '13px'
                        }}
                    >
                        ✏️ Редактировать
                    </button>
                </div>

                <div className={styles.body}>
                    <div className={styles.infoRow}><strong>ID:</strong> <span>...{profile.id.slice(-5)}</span></div>
                    <div className={styles.infoRow}><strong>О себе:</strong> <span>{profile.bio || 'Пусто...'}</span></div>
                    <div className={styles.infoRow}>
                        <strong>ДР:</strong> <span>{profile.birthday ? new Date(profile.birthday).toLocaleDateString() : '-'}</span>
                    </div>
                </div>

                <button onClick={logout} className={styles.logoutButton}>Выйти</button>
            </div>
          </aside>


          {/* --- ПРАВАЯ КОЛОНКА: СТЕНА --- */}
          <main className={styles.rightColumn}>
             
             {/* Форма создания поста */}
             <div style={{ marginBottom: '30px' }}>
                 <CreatePostForm onPostCreated={fetchPosts} />
             </div>

             {/* Лента */}
             <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {posts.map((post) => {
                    const authorName = post.profile?.username || 'Unknown';
                    const postAvatarUrl = post.profile?.avatar_url;
                    const canDelete = true; 

                    return (
                        <div key={post.id} className={styles.postCard}>
                           <div className={styles.postHeader}>
                               <div className={styles.postAuthor}>
                                   <div className={styles.postAvatar} style={postAvatarUrl ? {background:'transparent', padding:0} : {}}>
                                       {postAvatarUrl 
                                           ? <img src={`${API_URL}${postAvatarUrl}`} style={{width:'100%', height:'100%', objectFit:'cover', borderRadius: '50%'}} />
                                           : authorName.charAt(0).toUpperCase()
                                       }
                                   </div>
                                   <span className={styles.postUsername}>@{authorName}</span>
                               </div>
                               {canDelete && <button onClick={() => handleDeletePost(post.id)} className={styles.deleteBtn} title="Удалить">🗑️</button>}
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
                    )
                })}
                {posts.length === 0 && <div style={{textAlign:'center', color:'#666'}}>Постов нет</div>}
             </div>
          </main>

      </div> {/* Конец contentGrid */}


      {/* Модалка (вне сетки) */}
      {isEditModalOpen && (
        <EditProfileModal
            currentName={profile.display_name}
            currentBio={profile.bio || ''}
            onClose={() => setIsEditModalOpen(false)}
            onUpdate={() => { fetchProfile(); fetchPosts(); }}
        />
      )}

    </div>
  );
}