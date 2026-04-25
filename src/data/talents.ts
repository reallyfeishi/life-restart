import { Talent } from '@/types/talent';

export const TALENTS: Talent[] = [
  // Common talents
  { id: 'otaku', name: '重度宅体质', description: '出门即敏感，社交事件频率减少', rarity: 'common', effects: [{ type: 'event_trigger', description: '社交事件频率减少' }], worlds: ['modern', 'cyberpunk'], isHidden: false },
  { id: 'acg_gene', name: '二次元基因', description: '出身ACG爱好家庭，文化事件加成', rarity: 'common', effects: [{ type: 'event_trigger', description: '文化事件加成' }], worlds: ['modern', 'cyberpunk'], isHidden: false },
  { id: 'bookworm', name: '书虫附体', description: '学习类事件频率增加', rarity: 'common', effects: [{ type: 'event_trigger', description: '学习事件频率增加' }], worlds: ['modern', 'magic', 'transmigration'], isHidden: false },
  { id: 'strong_will', name: '意志坚定', description: '负面心理事件影响减少', rarity: 'common', effects: [{ type: 'special', description: '心理韧性增强' }], worlds: ['modern', 'wasteland', 'cyberpunk'], isHidden: false },
  { id: 'charming', name: '天生丽质', description: '社交和恋爱事件成功率增加', rarity: 'rare', effects: [{ type: 'attr_bonus', stat: 'appearance', value: 1, description: '颜值+1' }], worlds: ['modern', 'palace'], isHidden: false },
  { id: 'genius', name: '过目不忘', description: '智力事件成功率增加', rarity: 'rare', effects: [{ type: 'attr_bonus', stat: 'intelligence', value: 1, description: '智力+1' }], worlds: ['modern', 'magic', 'scifi'], isHidden: false },
  { id: 'athletic', name: '运动天赋', description: '体质事件成功率增加', rarity: 'common', effects: [{ type: 'attr_bonus', stat: 'constitution', value: 1, description: '体质+1' }], worlds: ['modern', 'wasteland', 'medieval'], isHidden: false },
  { id: 'rich_family', name: '家境殷实', description: '初始金钱获取翻倍', rarity: 'rare', effects: [{ type: 'attr_bonus', stat: 'wealth', value: 1, description: '家境+1' }], worlds: ['modern', 'palace'], isHidden: false },
  // Legendary talents
  { id: 'chosen_one', name: '时代宠儿', description: '全属性 +1，天生好命赶上好时候', rarity: 'legendary', effects: [
    { type: 'attr_bonus', stat: 'appearance', value: 1, description: '颜值+1' },
    { type: 'attr_bonus', stat: 'intelligence', value: 1, description: '智力+1' },
    { type: 'attr_bonus', stat: 'constitution', value: 1, description: '体质+1' },
    { type: 'attr_bonus', stat: 'wealth', value: 1, description: '家境+1' },
  ], worlds: ['modern'], isHidden: false },
  { id: 'immortal_body', name: '长生之体', description: '寿命延长30%，衰老减速', rarity: 'epic', effects: [{ type: 'death_resist', description: '寿命延长' }], worlds: ['xianxia', 'magic'], isHidden: false },
  { id: 'reincarnation', name: '前世记忆', description: '继承前世部分属性加成', rarity: 'epic', effects: [{ type: 'special', description: '前世属性继承' }], worlds: ['xianxia', 'transmigration', 'magic'], isHidden: false },
  { id: 'lucky_star', name: '幸运星', description: '随机正面事件触发率翻倍', rarity: 'legendary', effects: [{ type: 'event_trigger', description: '正面事件翻倍' }], worlds: ['modern', 'xianxia', 'cyberpunk', 'scifi'], isHidden: false },
  { id: 'martial_prodigy', name: '武道奇才', description: '修炼类事件效果翻倍', rarity: 'epic', effects: [{ type: 'attr_bonus', stat: 'constitution', value: 2, description: '体质+2' }], worlds: ['xianxia', 'medieval', 'wasteland'], isHidden: false },
  { id: 'alchemist', name: '炼丹术士', description: '可炼制特殊道具增强属性', rarity: 'epic', effects: [{ type: 'special', description: '炼丹能力' }], worlds: ['xianxia'], isHidden: false },
  { id: 'book_traveler', name: '天命书穿', description: '在书穿世界中获得先知优势', rarity: 'epic', effects: [{ type: 'event_trigger', description: '先知优势' }], worlds: ['transmigration'], isHidden: false },
  { id: 'palace_master', name: '宫斗高手', description: '宫斗事件胜率大幅提升', rarity: 'epic', effects: [{ type: 'attr_bonus', stat: 'intelligence', value: 2, description: '智力+2' }], worlds: ['palace'], isHidden: false },
  { id: 'arcane_scholar', name: '奥术天才', description: '魔法学习速度翻倍', rarity: 'epic', effects: [{ type: 'attr_bonus', stat: 'intelligence', value: 2, description: '智力+2' }], worlds: ['magic'], isHidden: false },
  { id: 'iron_will', name: '钢铁意志', description: '免疫所有恐惧类负面效果', rarity: 'epic', effects: [{ type: 'death_resist', description: '免疫恐惧' }], worlds: ['medieval', 'wasteland'], isHidden: false },
  { id: 'cyber_implant', name: '赛博义体', description: '义体适配度极高', rarity: 'epic', effects: [{ type: 'attr_bonus', stat: 'constitution', value: 2, description: '体质+2' }], worlds: ['cyberpunk'], isHidden: false },
  { id: 'star_pilot', name: '星际领航者', description: '太空探索事件成功率增加', rarity: 'epic', effects: [{ type: 'event_trigger', description: '太空探索加成' }], worlds: ['scifi'], isHidden: false },
  { id: 'wasteland_survivor', name: '废土老鸟', description: '在恶劣环境中生存率增加', rarity: 'epic', effects: [{ type: 'death_resist', description: '环境适应' }], worlds: ['wasteland'], isHidden: false },
];
