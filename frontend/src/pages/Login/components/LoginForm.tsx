import { FormEvent } from 'react';
import { Input, Button } from '../../../components';

interface LoginFormProps {
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
}

export const LoginForm = ({ onSubmit }: LoginFormProps) => {
  return (
    <form onSubmit={onSubmit} className="w-full max-w-md">
      <h1 className="text-3xl font-bold mb-2 text-gray-800">
        Boas vindas ao seu cardápio
      </h1>
      <p className="text-gray-500 mb-8 font-medium">Faça login</p>

      <Input
        type="text"
        label="Usuário"
        placeholder="Digite seu usuário"
      />

      <Input
        type="password"
        label="Senha"
        placeholder="Digite sua senha"
      />

      <Button type="submit" variant="primary" fullWidth>
        Entrar
      </Button>
    </form>
  );
};
