import { MenuItem } from '../../../types';

interface MenuItemCardProps {
  item: MenuItem;
  variant?: 'default' | 'highlight';
}

export const MenuItemCard = ({ item, variant = 'default' }: MenuItemCardProps) => {
  const hasImage = item.image && item.image.trim() !== '';
  
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
      {/* Imagem */}
      {hasImage ? (
        <div className="relative h-56 overflow-hidden">
          <img 
            src={item.image} 
            alt={item.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          <h2 className="absolute bottom-4 left-4 text-3xl font-black text-white drop-shadow-lg">
            {item.name}
          </h2>
        </div>
      ) : (
        <div className="relative h-56 bg-gradient-to-br from-[#B22222] to-[#8B0000] flex items-center justify-center">
          <h2 className="text-4xl font-black text-white text-center px-4">
            {item.name}
          </h2>
        </div>
      )}

      {/* Conteúdo */}
      <div className="p-6">
        {/* Nome (se tiver imagem, já está na imagem) */}
        {!hasImage && item.side_dish && (
          <p className="text-gray-600 text-base mb-4 leading-relaxed">
            {item.side_dish}
          </p>
        )}
        
        {hasImage && item.side_dish && (
          <p className="text-gray-600 text-base mb-4 leading-relaxed">
            <span className="font-semibold text-[#B22222]">Acompanhamentos:</span> {item.side_dish}
          </p>
        )}

        {/* Preços */}
        <div className="space-y-3">
          {/* Prato do Dia */}
          {item.daily_plate_price && (
            <div className="bg-gradient-to-r from-[#FFC107] to-[#FFD54F] rounded-xl p-4 shadow-md">
              <p className="text-sm font-semibold text-gray-800 mb-1">Prato Executivo</p>
              <p className="text-3xl font-black text-[#B22222]">
                R$ {parseFloat(item.daily_plate_price).toFixed(2)}
              </p>
            </div>
          )}

          {/* Marmitas */}
          {(item.lunch_box_price_small || item.lunch_box_price_medium || item.lunch_box_price_large) && (
            <div className="bg-gray-50 rounded-xl p-4 border-2 border-gray-200">
              <p className="text-sm font-bold text-[#B22222] mb-3 uppercase tracking-wide">
                🍱 Marmitas
              </p>
              <div className="grid grid-cols-3 gap-2">
                {item.lunch_box_price_small && (
                  <div className="text-center">
                    <p className="text-xs font-semibold text-gray-500 mb-1">Pequena</p>
                    <p className="text-lg font-bold text-gray-800">
                      R$ {parseFloat(item.lunch_box_price_small).toFixed(2)}
                    </p>
                  </div>
                )}
                {item.lunch_box_price_medium && (
                  <div className="text-center">
                    <p className="text-xs font-semibold text-gray-500 mb-1">Média</p>
                    <p className="text-lg font-bold text-gray-800">
                      R$ {parseFloat(item.lunch_box_price_medium).toFixed(2)}
                    </p>
                  </div>
                )}
                {item.lunch_box_price_large && (
                  <div className="text-center">
                    <p className="text-xs font-semibold text-gray-500 mb-1">Grande</p>
                    <p className="text-lg font-bold text-gray-800">
                      R$ {parseFloat(item.lunch_box_price_large).toFixed(2)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
