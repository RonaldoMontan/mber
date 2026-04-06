import React from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/Logo.png';

function Login() {
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    navigate('/menu');
  };

  return (
    <div className="flex h-screen w-full bg-white">
      
      <div className="hidden md:flex w-1/2 bg-[#B22222] items-center justify-center">
        <img 
          src={logo} 
          alt="Logo" 
          className="w-2/3 object-contain drop-shadow-2xl" 
        />
      </div>

      <div className="w-full md:w-1/2 flex items-center justify-center p-8">
        <form onSubmit={handleLogin} className="w-full max-w-md">
          <h1 className="text-3xl font-bold mb-2 text-gray-800">Boas vindas ao seu cardápio</h1>
          <p className="text-gray-500 mb-8 font-medium">Log in</p>
          
          <div className="mb-4">
            <label className="block font-bold mb-2 text-sm text-gray-700 italic">Usuário</label>
            <input 
              type="text" 
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-red-600 transition-colors" 
              placeholder="Digite seu usuário" 
            />
          </div>

          <div className="mb-6">
            <label className="block font-bold mb-2 text-sm text-gray-700 italic">Senha</label>
            <input 
              type="password" 
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-red-600 transition-colors" 
              placeholder="Digite sua senha" 
            />
          </div>

          <button 
            type="submit" 
            className="w-full bg-[#FFC107] hover:bg-[#FFD54F] text-black font-extrabold py-4 rounded-lg shadow-lg transform active:scale-95 transition-all uppercase tracking-widest"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
