import { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoginForm, LogoBanner } from './components';

const Login = () => {
  const navigate = useNavigate();

  const handleLogin = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    navigate('/admin');
  };

  return (
    <div className="flex h-screen w-full bg-white">
      <LogoBanner />
      
      <div className="w-full md:w-1/2 flex items-center justify-center p-8">
        <LoginForm onSubmit={handleLogin} />
      </div>
    </div>
  );
};

export default Login;
