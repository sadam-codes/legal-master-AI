
import { CreditCard } from 'lucide-react';

interface CardIconProps {
  cardType: string;
  className?: string;
}

export default function CardIcon({ cardType, className = '' }: CardIconProps) {
  const getCardIcon = () => {
    const type = cardType.toLowerCase();

    const baseStyle = `w-10 h-6 rounded ${className}`;

    if (type.includes('visa')) {
      return (
        <div className={`${baseStyle} bg-blue-800 text-white flex items-center justify-center`}>
          <span className="text-xs font-bold">VISA</span>
        </div>
      );
    } else if (type.includes('mastercard')) {
      return (
        <div className={`${baseStyle} bg-gradient-to-r from-red-500 to-yellow-500 text-white flex items-center justify-center`}>
          <span className="text-xs font-bold">MC</span>
        </div>
      );
    } else if (type.includes('amex') || type.includes('american express')) {
      return (
        <div className={`${baseStyle} bg-blue-600 text-white flex items-center justify-center`}>
          <span className="text-xs font-bold">AMEX</span>
        </div>
      );
    } else if (type.includes('discover')) {
      return (
        <div className={`${baseStyle} bg-orange-500 text-white flex items-center justify-center`}>
          <span className="text-xs font-bold">DISC</span>
        </div>
      );
    } else {
      return <CreditCard className={`h-6 w-6 ${className}`} />;
    }
  };

  return getCardIcon();
}
