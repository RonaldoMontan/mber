import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoginForm, LogoBanner } from './components';
import { auth } from '../../api';

const Login = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (username: string, password: string) => {
    setIsLoading(true);
    setError('');

    try {
      await auth.login({ username, password });
      navigate('/admin');
    } catch (err: any) {
      let errorMessage = 'Erro ao fazer login. Tente novamente.';

      if (err?.status === 401) {
        errorMessage = 'Usuário ou senha incorretos. Verifique suas credenciais.';
      } else if (err?.status === 403) {
        errorMessage = 'Sua conta está desativada. Entre em contato com o administrador.';
      } else if (err?.data?.error) {
        errorMessage = err.data.error;
      } else if (err?.message && !err.message.includes('status code')) {
        errorMessage = err.message;
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full bg-white">
      <LogoBanner />
      
      <div className="w-full md:w-1/2 flex items-center justify-center p-8">
        <LoginForm 
          onSubmit={handleLogin} 
          isLoading={isLoading}
          error={error}
        />
      </div>
    </div>
  );
};

export default Login;
