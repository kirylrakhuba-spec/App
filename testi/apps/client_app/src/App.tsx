import SignUpForm from './components/SignUpForm';
import LoginForm from './components/LoginForm';
import './App.css';
import ProfilePage from './components/ProfilePage';
import { Routes, Route,  Navigate} from 'react-router-dom';
import { useAuth } from './context/AuthContext';

function App() {
  const {accessToken} = useAuth()
  return (
    <div className="app-container">
      <Routes>
        {accessToken ? (
          <>
          <Route path="/profile" element={<ProfilePage/>}/>
          <Route path="*" element={<Navigate to="/profile" replace />}/>
          </>
        ):(
          <>
          <Route path="/signup" element={<SignUpForm />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
          </>
        )}
      </Routes>
    </div>
  );
}

export default App;