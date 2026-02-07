import React, { useState } from 'react';
import api from '../api';
import styles from './EditProfileModal.module.css';

interface Props {
  currentName: string;
  currentBio: string;
  onClose: () => void;
  onUpdate: () => void;
}

export default function EditProfileModal({ currentName, currentBio, onClose, onUpdate }: Props) {
  const [displayName, setDisplayName] = useState(currentName);
  const [bio, setBio] = useState(currentBio);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('displayName', displayName);
      formData.append('bio', bio);
      
      if (file) {
        formData.append('avatar', file);
      }

      await api.patch('/profiles/me', formData);
      
      onUpdate(); 
      onClose();  

    } catch (err) {
      console.error(err);
      alert('Ошибка обновления');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay}>
      <form className={styles.modal} onSubmit={handleSubmit}>
        <h3>Редактировать профиль</h3>
        
        <div>
            <label className={styles.fileLabel}>Сменить аватарку:</label>
            <input 
              type="file" 
              accept="image/*" 
              onChange={e => e.target.files && setFile(e.target.files[0])} 
              className={styles.input}
            />
        </div>

        <input 
          type="text" 
          placeholder="Имя" 
          value={displayName} 
          onChange={e => setDisplayName(e.target.value)} 
          className={styles.input}
          required
        />

        <textarea 
          placeholder="О себе" 
          value={bio} 
          onChange={e => setBio(e.target.value)} 
          className={styles.textarea}
        />

        <div className={styles.buttons}>
          <button type="button" onClick={onClose} className={styles.cancelBtn} disabled={loading}>
            Отмена
          </button>
          <button type="submit" className={styles.saveBtn} disabled={loading}>
            {loading ? 'Сохраняем...' : 'Сохранить'}
          </button>
        </div>
      </form>
    </div>
  );
}