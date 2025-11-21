import './StrategyCardNumber.css';

interface StrategyCardNumberProps {
  number: number;
  color: string;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export function StrategyCardNumber({
  number,
  color,
  size = 'medium',
  className = '',
}: StrategyCardNumberProps) {
  return (
    <div
      className={`strategy-card-number ${size} ${className}`}
      style={
        {
          '--strategy-color': color,
          borderColor: color,
        } as React.CSSProperties
      }
    >
      {number}
    </div>
  );
}
