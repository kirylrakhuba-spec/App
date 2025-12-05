import { createContext, useContext, useEffect, useState,type ReactNode } from 'react'
import api from '../api';

const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken'

interface AuthContextType{
    accessToken: string | null;
    login: (accessToken: string, refreshToken:string) => void;
    logout: ()=> void;
}



const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({children}: {children: ReactNode}){
    const [accessToken, setAccessToken] = useState<string | null>(
      localStorage.getItem(ACCESS_TOKEN_KEY) || null
    );
    const [isLoading,setIsLoading] = useState(true)

    useEffect(()=>{
      const checkAuth = async () => {
        const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY)
        if(!refreshToken){
          setAccessToken(null)
          localStorage.removeItem(ACCESS_TOKEN_KEY)
          setIsLoading(false)
          return
         }
    try{
      const response = await api.post('/auth/refresh',{refreshToken})
      const newAccessToken = response.data.accessToken;
      const newRefreshToken = response.data.refreshToken;

      setAccessToken(newAccessToken)
      localStorage.setItem(ACCESS_TOKEN_KEY, newAccessToken)
      localStorage.setItem(REFRESH_TOKEN_KEY,newRefreshToken)
    }catch(error){
      console.error('Refresh token failed', error);
        setAccessToken(null);
        localStorage.removeItem(ACCESS_TOKEN_KEY)
        localStorage.removeItem(REFRESH_TOKEN_KEY);
      } finally {
        setIsLoading(false);
    }
  }
  checkAuth()
  },[])
  const login = (accessToken: string, refreshToken:string) => {
    setAccessToken(accessToken);
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)

  }
  const logout =async ()=>{
    try{
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY)
    if(refreshToken){
      await api.post('/auth/logout',{refreshToken})
      console.log('Сессия успешно убита на сервере');}
    }catch(error){
      console.error('Ошибка при логауте на сервере (но мы все равно выходим)', error);
    }finally{
      setAccessToken(null)
    localStorage.removeItem(ACCESS_TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
    }
    }
    

  if (isLoading) {
    return <div>Загрузка...</div>;
  }

  return(
    <AuthContext.Provider value={{accessToken,login,logout}}>{children}</AuthContext.Provider>
  )
}

export const useAuth = () =>{
    const context = useContext(AuthContext)
    if(!context){
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context
}