import { FormEvent, useState } from 'react';
import { Input, Button } from '../../../components';

interface LoginFormProps {
  onSubmit: (username: string, password: string) => void;
  isLoading?: boolean;
  error?: string;
}

export const LoginForm = ({ onSubmit, isLoading, error }: LoginFormProps) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(username, password);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md">
      <h1 className="text-3xl font-bold mb-2 text-gray-800">
        Boas vindas ao seu cardápio
      </h1>
      <p className="text-gray-500 mb-8 font-medium">Faça login</p>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <Input
        type="text"
        label="Usuário"
        placeholder="Digite seu usuário"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        disabled={isLoading}
        required
      />

      <Input
        type="password"
        label="Senha"
        placeholder="Digite sua senha"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        disabled={isLoading}
        required
      />

      <Button type="submit" variant="primary" fullWidth disabled={isLoading}>
        {isLoading ? 'Entrando...' : 'Entrar'}
      </Button>
    </form>
  );
};
