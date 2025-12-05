import React, { useState } from 'react';
import api from '../api';
import styles from './CreatePostForm.module.css';


interface Props {
  onPostCreated: () => void;
}

export default function CreatePostForm({ onPostCreated }: Props) {
  const [caption, setCaption] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

 
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      
     
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return alert('Выбери картинку, э!');

    setLoading(true);

    try {
     
      const formData = new FormData();
      formData.append('image', file); 
      if (caption) {
        formData.append('caption', caption);
      }

     
      await api.post('/posts', formData);

      // clear form after succsess
      setCaption('');
      setFile(null);
      setPreview(null);
      
      // ProfilePage need to updaate page
      onPostCreated();
      
    } catch (error) {
      console.error('Ошибка создания поста:', error);
      alert('Не удалось создать пост');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h3>Создать новый пост</h3>
      <form onSubmit={handleSubmit} className={styles.form}>
        
        
        <input 
          type="file" 
          accept="image/*" // only pictures
          onChange={handleFileChange} 
          className={styles.fileInput}
        />

        
        {preview && <img src={preview} alt="Preview" className={styles.preview} />}

        
        <textarea
          placeholder="Что нового?"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          className={styles.textarea}
        />

        <button type="submit" className={styles.button} disabled={loading || !file}>
          {loading ? 'Загрузка...' : 'Опубликовать'}
        </button>
      </form>
    </div>
  );
}