import influenceIcon from '@/assets/icons/color/influence-bg.png';
import resourcesIcon from '@/assets/icons/color/resources-bg.png';
import tradeGoodIcon from '@/assets/icons/color/trade-good-1.png';
import styles from './AbilityText.module.css';

interface AbilityTextProps {
  text: string;
}

export function AbilityText({ text }: AbilityTextProps) {
  // Split text by icon markers and render with inline images
  const parseText = (text: string) => {
    const parts: (string | JSX.Element)[] = [];
    let currentIndex = 0;
    let key = 0;

    // Icon mapping
    const icons: Record<string, string> = {
      '[INFLUENCE]': influenceIcon,
      '[RESOURCES]': resourcesIcon,
      '[TRADE_GOOD]': tradeGoodIcon,
    };

    // Find all icon markers
    const regex = /\[INFLUENCE\]|\[RESOURCES\]|\[TRADE_GOOD\]/g;
    let match;

    while ((match = regex.exec(text)) !== null) {
      // Add text before the icon
      if (match.index > currentIndex) {
        parts.push(text.substring(currentIndex, match.index));
      }

      // Add the icon
      const iconSrc = icons[match[0]];
      parts.push(
        <img
          key={`icon-${key++}`}
          src={iconSrc}
          alt={match[0].replace(/[\[\]]/g, '')}
          className={styles.inlineIcon}
        />
      );

      currentIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (currentIndex < text.length) {
      parts.push(text.substring(currentIndex));
    }

    return parts;
  };

  // Split by newlines and render each line
  const lines = text.split('\n');

  return (
    <div className={styles.abilityText}>
      {lines.map((line, index) => (
        <div key={index} className={styles.line}>
          {parseText(line)}
        </div>
      ))}
    </div>
  );
}
