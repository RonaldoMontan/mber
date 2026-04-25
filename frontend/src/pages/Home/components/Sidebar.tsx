import { useCategories } from '../../../hooks/useCategories';
import { useState } from 'react';

interface SidebarProps {
  selectedCategory: string | null;
  onCategorySelect: (categoryCode: string | null) => void;
}

export const Sidebar = ({ selectedCategory, onCategorySelect }: SidebarProps) => {
  const { categories, loading } = useCategories();
  const [showContactModal, setShowContactModal] = useState(false);
  const visibleCategories = categories.filter((category) => category.code !== 'prato-do-dia');

  return (
    <>
      {/* DESKTOP SIDEBAR - Escondida em mobile */}
      <aside className="hidden md:flex w-80 bg-gradient-to-b from-[#B22222] via-[#A01F1F] to-[#8B0000] text-white flex-col fixed h-full shadow-2xl overflow-y-auto">
        {/* Logo Section */}
        <div className="flex flex-col items-center py-10 px-6 bg-black/10">
          <div className="w-40 h-40 rounded-full bg-white/10 backdrop-blur-sm border-4 border-white/20 flex items-center justify-center mb-6 p-6 shadow-xl hover:scale-105 transition-transform duration-300">
            <img src="/logo-sidebar.png" alt="Logo" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-3xl font-black tracking-wider text-[#FFC107] drop-shadow-lg">MBER</h1>
          <p className="text-sm text-white/90 mt-2 font-medium tracking-wide">MINAS BAR E RESTAURANTE</p>
          <div className="w-20 h-1 bg-[#FFC107] mt-4 rounded-full"></div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-6 py-8">
          {/* Main Menu Button */}
          <button
            onClick={() => onCategorySelect(null)}
            className={`w-full text-left px-6 py-4 rounded-xl mb-6 font-bold text-lg uppercase tracking-wide transition-all duration-300 ${
              selectedCategory === null 
                ? 'bg-[#FFC107] text-[#B22222] shadow-lg scale-105' 
                : 'bg-white/10 hover:bg-white/20 backdrop-blur-sm'
            }`}
          >
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
              </svg>
              <span>Cardápio</span>
            </div>
          </button>

          {/* Categories Section */}
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#FFC107] mb-4 px-2">Categorias</h2>
            {loading ? (
              <div className="flex items-center gap-2 px-6 py-4 text-white/60">
                <div className="w-4 h-4 border-2 border-white/60 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm">Carregando...</span>
              </div>
            ) : visibleCategories.length > 0 ? (
              <div className="space-y-2">
                {visibleCategories.map((category) => (
                  <button
                    key={category.code}
                    onClick={() => onCategorySelect(category.code)}
                    className={`w-full text-left px-6 py-4 rounded-xl font-semibold transition-all duration-300 ${
                      selectedCategory === category.code
                        ? 'bg-[#FFC107] text-[#B22222] shadow-lg scale-105'
                        : 'bg-white/5 hover:bg-white/15 backdrop-blur-sm hover:scale-102'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm5-3v8h2.5v8H21V2c-2.76 0-5 2.24-5 4z"/>
                      </svg>
                      <span>{category.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-white/60 px-6 py-4">Nenhuma categoria disponível</p>
            )}
          </div>
        </nav>

        {/* Contact Section */}
        <div className="px-6 py-8 space-y-4 bg-black/20 backdrop-blur-sm">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#FFC107] mb-4">Contato</h3>
          
          <div className="flex items-start gap-4 p-4 bg-white/10 rounded-xl hover:bg-white/15 transition-colors backdrop-blur-sm">
            <div className="w-10 h-10 rounded-full bg-[#FFC107] flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-[#B22222]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 00-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z"/>
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold mb-1">Delivery</p>
              <p className="text-xs text-white/90">(19) 98860-6368</p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 bg-white/10 rounded-xl hover:bg-white/15 transition-colors backdrop-blur-sm">
            <div className="w-10 h-10 rounded-full bg-[#FFC107] flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-[#B22222]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold mb-1">Endereço</p>
              <p className="text-xs text-white/90 leading-relaxed">R. XXXXXXXXX XXXXXX, XX, XXXX</p>
            </div>
          </div>
        </div>
      </aside>

      {/* MOBILE TOP BAR - Logo */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-[#B22222] text-white shadow-lg z-50">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full border-2 border-white/30 flex items-center justify-center p-1">
              <img src="/logo-sidebar.png" alt="Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="text-lg font-bold">MBER</h1>
              <p className="text-xs text-white/80">MINAS BAR E RESTAURANTE</p>
            </div>
          </div>
          <button 
            onClick={() => setShowContactModal(true)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 00-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z"/>
            </svg>
          </button>
        </div>
      </div>

      {/* MOBILE BOTTOM NAVIGATION */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
        <div className="flex items-center justify-around p-2">
          <button
            onClick={() => onCategorySelect(null)}
            className={`flex flex-col items-center gap-1 p-3 rounded-lg transition-colors ${
              selectedCategory === null ? 'bg-[#B22222] text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
            </svg>
            <span className="text-xs font-semibold">Cardápio</span>
          </button>

          {!loading && visibleCategories.map((category) => (
            <button
              key={category.code}
              onClick={() => onCategorySelect(category.code)}
              className={`flex flex-col items-center gap-1 p-3 rounded-lg transition-colors ${
                selectedCategory === category.code ? 'bg-[#B22222] text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm5-3v8h2.5v8H21V2c-2.76 0-5 2.24-5 4z"/>
              </svg>
              <span className="text-xs font-semibold truncate max-w-[60px]">{category.name}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* MODAL DE CONTATO - Mobile */}
      {showContactModal && (
        <div className="md:hidden fixed inset-0 bg-black/50 z-50 flex items-end">
          <div className="bg-white w-full rounded-t-3xl p-6 animate-slide-up">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-[#B22222]">Contato</h2>
              <button 
                onClick={() => setShowContactModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                <svg className="w-6 h-6 text-[#B22222] flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 00-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z"/>
                </svg>
                <div>
                  <p className="font-semibold text-gray-800 mb-1">Peça por delivery!</p>
                  <p className="text-gray-600">(XX) XXXXX-XXXX</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                <svg className="w-6 h-6 text-[#B22222] flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
                <div>
                  <p className="font-semibold text-gray-800 mb-1">Conheça nosso espaço!</p>
                  <p className="text-gray-600">R. XXXXXXXXX XXXXXX, XX, XXXX</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
