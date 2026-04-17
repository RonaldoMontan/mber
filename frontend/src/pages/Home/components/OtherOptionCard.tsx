import { MenuItem } from '../../../types';
import { Card } from '../../../components';

interface OtherOptionCardProps {
  item: MenuItem;
}

export const OtherOptionCard = ({ item }: OtherOptionCardProps) => {
  return (
    <Card variant="primary">
      <h3 className="text-xl font-bold text-[#FFC107]">{item.name}</h3>
      {item.side_dish && (
        <p className="text-sm mt-1 opacity-80">{item.side_dish}</p>
      )}
      <div className="mt-3 text-right">
        {item.daily_plate_price && (
          <p className="text-xl font-bold">R$ {item.daily_plate_price}</p>
        )}
      </div>
    </Card>
  );
};
