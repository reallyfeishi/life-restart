export type Gender = 'male' | 'female' | 'custom';
export type Race = 'human' | 'elf' | 'vampire' | 'android' | 'dragonborn' | 'custom';

export interface Identity {
  gender: Gender;
  genderCustom?: string;
  race: Race;
  raceCustom?: string;
  extraInfo: string;
  playingAs?: string;
}
