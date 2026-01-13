
import { TierId, TierConfig } from './types';

export const TIER_CONFIGS: TierConfig[] = [
  {
    id: TierId.Hãng,
    label: '夯',
    color: '#ff0000',
    bgColor: 'bg-red-600',
    textColor: 'text-white'
  },
  {
    id: TierId.TopTier,
    label: '顶级',
    color: '#ff7f00',
    bgColor: 'bg-orange-500',
    textColor: 'text-white'
  },
  {
    id: TierId.Elite,
    label: '人上人',
    color: '#ffff00',
    bgColor: 'bg-yellow-400',
    textColor: 'text-black'
  },
  {
    id: TierId.NPC,
    label: 'NPC',
    color: '#ffffff',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-900'
  },
  {
    id: TierId.Failed,
    label: '拉完了',
    color: '#808080',
    bgColor: 'bg-gray-500',
    textColor: 'text-white'
  }
];

export const INITIAL_STATE = {
  [TierId.Hãng]: [],
  [TierId.TopTier]: [],
  [TierId.Elite]: [],
  [TierId.NPC]: [],
  [TierId.Failed]: [],
  [TierId.Pool]: []
};
