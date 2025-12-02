import type { UnitType } from './combatConfig';

// Import all ship images
import carrierImage from '@/assets/ships/Carrier_Plastic.webp';
import cruiserImage from '@/assets/ships/Cruiser_Plastic.webp';
import destroyerImage from '@/assets/ships/Destroyer_Plastic.webp';
import dreadnoughtImage from '@/assets/ships/Dreadnought_Plastic.webp';
import fighterImage from '@/assets/ships/Fighter_Plastic.webp';
import flagshipImage from '@/assets/ships/Flagship_Plastic.webp';
import warSunImage from '@/assets/ships/War_Sun_Plastic.webp';
import mechImage from '@/assets/ships/Mech_Plastic.webp';
import infantryImage from '@/assets/ships/Infantry_Plastic.webp';
import pdsImage from '@/assets/ships/PDS_Plastic.webp';
import spaceDockImage from '@/assets/ships/Space_Dock_Plastic.webp';

export const UNIT_IMAGES: Record<UnitType, string> = {
  war_sun: warSunImage,
  dreadnought: dreadnoughtImage,
  cruiser: cruiserImage,
  carrier: carrierImage,
  destroyer: destroyerImage,
  fighter: fighterImage,
  flagship: flagshipImage,
  infantry: infantryImage,
  mech: mechImage,
  pds: pdsImage,
  space_dock: spaceDockImage,
};

export function getUnitImage(unitType: UnitType): string {
  return UNIT_IMAGES[unitType];
}
