
export interface TierItem {
  id: string;
  url: string;
  name?: string;
}

export enum TierId {
  Hãng = 'hãng',
  TopTier = 'toptier',
  Elite = 'elite',
  NPC = 'npc',
  Failed = 'failed',
  Pool = 'pool'
}

export interface TierConfig {
  id: TierId;
  label: string;
  color: string;
  bgColor: string;
  textColor: string;
}

export interface AppState {
  [TierId.Hãng]: TierItem[];
  [TierId.TopTier]: TierItem[];
  [TierId.Elite]: TierItem[];
  [TierId.NPC]: TierItem[];
  [TierId.Failed]: TierItem[];
  [TierId.Pool]: TierItem[];
}
