export type TalentRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface TalentEffect {
  type: 'attr_bonus' | 'event_trigger' | 'death_resist' | 'special';
  stat?: 'appearance' | 'intelligence' | 'constitution' | 'wealth';
  value?: number;
  description: string;
}

export interface Talent {
  id: string;
  name: string;
  description: string;
  rarity: TalentRarity;
  effects: TalentEffect[];
  worlds: string[];
  isHidden?: boolean;
}
