export type ChallengeType = 'anime' | 'character' | 'opening' | 'emoji';

export interface AnimeInfo {
  malId: number;
  name: string;
  imgMedium?: string;
  imgLarge?: string;
}

export interface AnimeData {
  veryEasy: { url: string; publicId: string } | string;
  easy: { url: string; publicId: string } | string;
  medium: { url: string; publicId: string } | string;
  hard: { url: string; publicId: string } | string;
}

export interface CharacterData {
  character: { url: string; publicId: string } | string;
}

export interface OpeningData {
  mediaType: 'opening' | 'ending';
  opening: { url: string; publicId: string } | string;
}

export interface EmojiData {
  emojis: string[];
}

export type ChallengeData = AnimeData | CharacterData | OpeningData | EmojiData;

export interface ChallengeResponseDTO {
  type: ChallengeType;
  anime: AnimeInfo;
  data: ChallengeData;
}

export interface DailyChallengesResponse {
  challenges: ChallengeResponseDTO[];
  date: string;
}

export interface ChallengesListResponse {
  challenges: ChallengeResponseDTO[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Helper to extract URL from data field (which can be string or {url, publicId})
export function getUrl(field: { url: string; publicId: string } | string | undefined): string {
  if (!field) return '';
  if (typeof field === 'string') return field;
  return field.url;
}

// Type guards
export function isAnimeData(_data: ChallengeData, type: ChallengeType): _data is AnimeData {
  return type === 'anime';
}
export function isCharacterData(_data: ChallengeData, type: ChallengeType): _data is CharacterData {
  return type === 'character';
}
export function isOpeningData(_data: ChallengeData, type: ChallengeType): _data is OpeningData {
  return type === 'opening';
}
export function isEmojiData(_data: ChallengeData, type: ChallengeType): _data is EmojiData {
  return type === 'emoji';
}
