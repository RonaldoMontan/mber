import React, { useEffect, useState } from 'react'; // <-- Faltava o { useState } aqui!
import axios from 'axios';
import logo from '../assets/Logo.png';

const Home = () => {
  const [dishes, setDishes] = useState([]); // Agora o useState vai funcionar
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Buscando os pratos do Django
    axios.get('http://localhost:8000/api/dishes/')
      .then(res => {
        console.log("Dados que chegaram:", res.data);
        setDishes(res.data.results || res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Erro ao buscar pratos:", err.response?.data || err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="flex h-screen items-center justify-center">Loading Menu...</div>;

  // Filtramos os pratos do dia
  const dishOfTheDay = dishes.find(d => d.dishDay === true);
  const otherOptions = dishes.filter(d => d.dishDay === false && d.available === true);

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans text-gray-800">
      
      {/* SIDEBAR (Mantém o código anterior) */}
      <aside className="w-72 bg-[#B22222] text-white flex flex-col p-8 fixed h-full shadow-2xl">
        <img src={logo} alt="Logo" className="w-32 mx-auto mb-10" />
        <h2 className="text-2xl font-bold uppercase">Menu</h2>
      </aside>

      <main className="flex-1 ml-72 p-12 flex flex-col items-center">
        
        {/* SÓ MOSTRA O PRATO DO DIA SE ELE EXISTIR NO BANCO */}
        {dishOfTheDay ? (
          <section className="w-full max-w-4xl mb-12 text-center">
            <h1 className="text-5xl font-black text-[#B22222] mb-8 uppercase italic">Dish of the Day</h1>
            <div className="bg-[#B22222] text-white rounded-3xl p-8 shadow-xl">
              <h2 className="text-3xl font-bold text-[#FFC107]">{dishOfTheDay.name}</h2>
              <p className="text-lg mt-2 opacity-90">{dishOfTheDay.description}</p>
              <p className="text-3xl font-black mt-4">R$ {dishOfTheDay.price}</p>
            </div>
          </section>
        ) : (
          <p className="text-gray-400 italic mb-8">No special dish selected for today.</p>
        )}

        {/* LISTA AS OUTRAS OPÇÕES DISPONÍVEIS */}
        <section className="w-full max-w-4xl">
          <h2 className="text-4xl font-black text-[#B22222] mb-8 text-center uppercase italic">Other Options:</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {otherOptions.map((dish) => (
              <div key={dish.id} className="bg-[#B22222] text-white rounded-3xl p-6 shadow-lg">
                <h3 className="text-xl font-bold text-[#FFC107]">{dish.name}</h3>
                <p className="text-sm mt-1 opacity-80">{dish.description}</p>
                <p className="text-xl font-bold mt-3 text-right">R$ {dish.price}</p>
              </div>
            ))}
          </div>
          {otherOptions.length === 0 && <p className="text-center text-gray-400">Nothing else on the menu yet.</p>}
        </section>
      </main>
    </div>
  );
};

export default Home;